package db

import (
  "context"
  "errors"
  "reflect"
  "strings"
  "sync"
  "sync/atomic"

  utils "github.com/ItsMeSamey/go_utils"
  cmap "github.com/orcaman/concurrent-map/v2"
  "go.mongodb.org/mongo-driver/v2/bson"
  "go.mongodb.org/mongo-driver/v2/mongo"
)

type Collection[T any] struct {
  sync.RWMutex
  Coll *mongo.Collection

  Uptodate atomic.Bool

  AllItems []*T
  AllItemsMap cmap.ConcurrentMap[bson.ObjectID, *T]
}

func (c *Collection[T]) mustInit(coll *mongo.Collection) []*T {
  c.Coll = coll
  c.AllItemsMap = cmap.NewWithCustomShardingFunction[bson.ObjectID, *T](ObjectIdShardingFunction)

  retval, err := c.All()
  if err != nil { panic(err) }
  return retval
}


/// Get the result of a db quarry in a `out` object, returns true if the object exists
/// NOTE: `out` must be a pointer or Programme will panic !
func (c *Collection[T]) getExists(filter any) (out T, exists bool, err error) {
  result := c.Coll.FindOne(context.Background(), filter)
  err = result.Err()

  if errors.Is(err, mongo.ErrNoDocuments) {
    err = nil
    return
  } else if err != nil {
    err = utils.WithStack(err)
    return
  }

  err = result.Decode(&out)
  if err = utils.WithStack(err); err != nil { return }

  exists = true
  return
}

func (c *Collection[T]) get(filter any) (out T, err error) {
  out, exists, err := c.getExists(filter)
  if !exists {
    err = utils.WithStack(errors.New("DB.get: document does not exist"))
  }
  return
}

func (c *Collection[T]) exists(filter any) (exists bool, err error) {
  result := c.Coll.FindOne(context.Background(), filter)
  err = result.Err()

  if errors.Is(err, mongo.ErrNoDocuments) {
    return
  } else if err != nil {
    err = utils.WithStack(err)
    return
  }

  exists = true
  return
}

func (c *Collection[T]) GetById(id bson.ObjectID) (out T, err error) {
  out, exists, err := c.GetExistsById(id)
  if !exists {
    err = utils.WithStack(errors.New("DB.get: document does not exist"))
  }
  return
}

func (c *Collection[T]) GetExistsById(id bson.ObjectID) (out T, exists bool, err error) {
  valuePointer, ok := c.AllItemsMap.Get(id)
  if ok {
    return *valuePointer, true, nil
  }

  outCopy, exists, err := c.getExists(bson.M{ "_id": id })
  if !exists { return }
  if err = utils.WithStack(err); err != nil { return }

  c.AllItemsMap.Set(id, &outCopy)
  func ()  {
    c.Lock()
    defer c.Unlock()
    c.AllItems = append(c.AllItems, &outCopy)
  }()

  return outCopy, true, nil
}

func (c *Collection[T]) Insert(val T) (id bson.ObjectID, err error) {
  result, err := c.Coll.InsertOne(context.Background(), val)
  if err = utils.WithStack(err); err != nil { return }

  id = result.InsertedID.(bson.ObjectID)

  reflect.ValueOf(&val).Elem().FieldByName("Id").Set(reflect.ValueOf(id))

  c.AllItemsMap.Set(id, &val)
  c.Lock()
  defer c.Unlock()
  c.AllItems = append(c.AllItems, &val)

  return
}

func (c *Collection[T]) UpdateSetById(id bson.ObjectID, update bson.M) (err error) {
  result, err := c.Coll.UpdateOne(context.Background(), bson.M{"_id": id}, bson.M{"$set": update})
  if err = utils.WithStack(err); err != nil { return }

  if result.ModifiedCount == 0 { return }

  valPtr, ok := c.AllItemsMap.Get(id)
  if !ok {
    _, err = c.GetById(id)
    if err = utils.WithStack(err); err != nil { return }
    return
  }

  cpy := *valPtr
  t := reflect.TypeOf(&cpy).Elem()
  v := reflect.ValueOf(&cpy).Elem()


  for i := range t.NumField() {
    field := t.Field(i)
    tag, ok := field.Tag.Lookup("bson")
    if !ok {
      tag = field.Name
    } else {
      tag = strings.SplitN(tag, ",", 2)[0]
    }
    newVal, ok := update[tag]
    if !ok { continue }

    v.Field(i).Set(reflect.ValueOf(newVal))
  }

  *valPtr = cpy
  return
}

func (c *Collection[T]) All() (result []*T, err error) {
  if c.Uptodate.Load() {
    return c.AllItems, nil
  }

  {
    cursor, err := c.Coll.Find(context.Background(), bson.M{})
    if err = utils.WithStack(err); err != nil { return result, err }
    cursor.All(context.Background(), &result)
  }
  
  fieldIndex := -1

  var vt T

  t := reflect.TypeOf(vt)
  for i := range t.NumField() {
    tag, ok := t.Field(i).Tag.Lookup("bson")
    if !ok { continue }
    tag = strings.SplitN(tag, ",", 2)[0]
    if tag == "_id" {
      fieldIndex = i
      break
    }
  }

  if fieldIndex == -1 {
    panic("No _id field in struct " + t.String())
  }

  for _, v := range result {
    c.AllItemsMap.Set(*(*bson.ObjectID)(reflect.ValueOf(v).Elem().Field(fieldIndex).Addr().UnsafePointer()), v)
  }

  c.Uptodate.Store(true)

  c.Lock()
  defer c.Unlock()
  c.AllItems = result

  return
}

