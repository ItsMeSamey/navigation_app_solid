package router

import (
  "errors"
  "net/http"
  "sync"
  "sync/atomic"
  "time"

  "backend/db"
  "backend/router/middleware"

  utils "github.com/ItsMeSamey/go_utils"
  "github.com/goccy/go-json"
  "github.com/gofiber/fiber/v3"
  "github.com/kataras/jwt"
  "github.com/valyala/fasthttp"
  "go.mongodb.org/mongo-driver/v2/bson"
)


func adminToJwt(admin db.Admin) ([]byte, error) {
  data, err := jwt.Sign(jwt.HS256, middleware.JWT_SECRET, middleware.UserJWT(admin))
  return data, utils.WithStack(err)
}

// Return jwt token on success
func AdminLogin(c fiber.Ctx) (err error) {
  token := utils.B2S(c.BodyRaw())

  var body []byte
  {
    req := fasthttp.AcquireRequest()
    defer fasthttp.ReleaseRequest(req)
    req.SetRequestURI("https://www.googleapis.com/userinfo/v2/me")    
    req.Header.Set("Authorization", "Bearer "+token)
    resp := fasthttp.AcquireResponse()
    defer fasthttp.ReleaseResponse(resp)

    err = fasthttp.DoRedirects(req, resp, 10);
    if err = utils.WithStack(err); err != nil { return }
    if resp.StatusCode() != http.StatusOK {
      c.Status(resp.StatusCode())
      return c.Send(resp.Body())
    }

    body = resp.Body()
  }

  var userMail struct { Email string `json:"email"` }
  err = json.Unmarshal(body, &userMail)
  if err = utils.WithStack(err); err != nil { return }

  user, ok := db.AdminMailMap[userMail.Email]
  if !ok {
    return utils.WithStack(errors.New("user not found"))
  }

  data, err := adminToJwt(*user)
  if err = utils.WithStack(err); err != nil { return }

  return c.Send(data)
}

// Location specific functions

func validateLocation(location db.Location) (err error) {
  if len(location.Names) == 0 {
    return utils.WithStack(errors.New("atleast one name is required"))
  }
  if location.Lat == 0 || location.Long == 0 {
    return utils.WithStack(errors.New("latitude and longitude are required"))
  }
  if location.Lat < -90 || location.Lat > 90 {
    return utils.WithStack(errors.New("latitude must be between -90 and 90"))
  }
  if location.Long < -180 || location.Long > 180 {
    return utils.WithStack(errors.New("longitude must be between -180 and 180"))
  }

  return
}

func AddLocation(c fiber.Ctx) (err error) {
  var location db.Location

  if err := c.Bind().JSON(&location); err != nil {
    return utils.WithStack(err)
  }

  location.Id = bson.NilObjectID
  location.Creator = c.UserContext().(middleware.ContextWithJWT).UserJWT.Id

  err = validateLocation(location)
  if err = utils.WithStack(err); err != nil { return }

  _, err = db.LocationDb.Insert(location)
  if err = utils.WithStack(err); err != nil { return }

  go UpdateLocationCacheMaybe()
  return c.SendStatus(http.StatusCreated)
}

func UpdateLocation(c fiber.Ctx) (err error) {
  var location db.Location

  if err := c.Bind().JSON(&location); err != nil {
    return utils.WithStack(err)
  }

  // validateLocation
  if location.Id == bson.NilObjectID {
    return utils.WithStack(errors.New("id is required"))
  }
  err = validateLocation(location)
  if err = utils.WithStack(err); err != nil { return }

  // Update value
  ptr, ok := db.LocationDb.AllItemsMap.Get(location.Id)
  if !ok {
    return utils.WithStack(errors.New("location not found"))
  }
  old := *ptr

  changed := bson.M{
    "names": location.Names,
    "miss": location.Misspellings,
  }
  creator := c.UserContext().(middleware.ContextWithJWT).UserJWT.Id
  if old.Creator != creator {
    changed["creator"] = creator
  }
  if old.Lat != location.Lat {
    changed["lat"] = location.Lat
  }
  if old.Long != location.Long {
    changed["long"] = location.Long
  }

  err = db.LocationDb.UpdateSetById(location.Id, changed)
  if err = utils.WithStack(err); err != nil { return }

  go UpdateLocationCacheMaybe()
  return c.SendStatus(http.StatusAccepted)
}

func DeleteLocation(c fiber.Ctx) (err error) {
  id, err := bson.ObjectIDFromHex(c.Params("id"))
  if err = utils.WithStack(err); err != nil { return }

  deletedCount, err := db.LocationDb.DeleteById(id)
  if err = utils.WithStack(err); err != nil { return }

  if deletedCount == 0 {
    return utils.WithStack(errors.New("location not found"))
  }

  go UpdateLocationCacheMaybe()
  return c.SendStatus(http.StatusOK)
}


var locationListCache atomic.Pointer[[]byte]
var locationCacheUpdateLock sync.Mutex
var locationListCacheTimestamp atomic.Int64
func UpdateLocationCacheMaybe() (err error) {
  if !locationCacheUpdateLock.TryLock() { return }
  defer locationCacheUpdateLock.Unlock()
  return RacyUpdateLocationCache()
}

func RacyUpdateLocationCache() (err error) {
  locations, err := db.LocationDb.All()
  data, err := json.Marshal(locations)
  if err = utils.WithStack(err); err != nil { return }
   
  locationListCacheTimestamp.Store(time.Now().Unix())
  locationListCache.Store(&data)

  return
}

func ReferchAllAdmins(c fiber.Ctx) (err error) {
  db.AdminDb.Uptodate.Store(false);
  _, err = db.AdminDb.All()
  if err = utils.WithStack(err); err != nil { return }

  return c.SendStatus(http.StatusOK)
}

func ReferchAllLocations(c fiber.Ctx) (err error) {
  db.LocationDb.Uptodate.Store(false);
  _, err = db.LocationDb.All()
  if err = utils.WithStack(err); err != nil { return }

  return c.SendStatus(http.StatusOK)
}

func UpdateLocationCache(c fiber.Ctx) error { 
    locationCacheUpdateLock.Lock()
    defer locationCacheUpdateLock.Unlock()
    RacyUpdateLocationCache()
    return c.SendStatus(200)
  }

