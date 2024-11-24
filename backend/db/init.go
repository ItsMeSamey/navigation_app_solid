package db

import (
  "backend/helpers"
  "context"
  "log"
  "os"
  "sync"
  "time"

  utils "github.com/ItsMeSamey/go_utils"
  "go.mongodb.org/mongo-driver/v2/bson"
  "go.mongodb.org/mongo-driver/v2/mongo"
  "go.mongodb.org/mongo-driver/v2/mongo/options"
)

var (
  /// The main Database
  Db *mongo.Database

  /// All the Db declarations
  AdminDb    = Collection[Admin]{}
  LocationDb = Collection[Location]{}
)

func ObjectIdShardingFunction(key bson.ObjectID) uint32 {
  return (uint32(key[0]^key[1]^key[2]) << 3) | (uint32(key[3]^key[4]^key[5]) << 2) | (uint32(key[6]^key[7]^key[8]) << 1) | uint32(key[9]^key[10]^key[11])
}

/// Initialize all Database's
/// Programme MUST panic if this function errors as this is unrecoverable
func init() {
  // Set env vars form the .env
  err := utils.Load(".env", func (k, v string) error {
    log.Println("Setting", k, "to", v)
    return os.Setenv(k, v)
  })
  if err != nil { panic(err)  }

  ctx, cancel := context.WithTimeout(context.Background(), 10 * time.Second)
  defer cancel()


  client, err := mongo.Connect(options.Client().ApplyURI(helpers.Getenv("MONGOURI")))
  if err != nil { panic(err) }

  err = client.Ping(ctx, nil)
  if err != nil { panic(err) }

  Db = client.Database("2024_game_theory")

  wg := sync.WaitGroup{}
  wg.Add(2)

  go func() {
    defer wg.Done()
    admins := AdminDb.mustInit(Db.Collection("admins"))
    for _, admin := range admins {
      AdminMailMap[admin.Mail] = admin
    }
  }()
  go func() {
    defer wg.Done()
    _ = LocationDb.mustInit(Db.Collection("locations"))
  }()

  wg.Wait()
}

