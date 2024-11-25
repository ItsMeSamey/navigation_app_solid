package router

import (
  "log"
  "os"
  "strconv"
  "time"

  "backend/router/middleware"

  utils "github.com/ItsMeSamey/go_utils"
  "github.com/goccy/go-json"
  "github.com/gofiber/fiber/v3"
  "github.com/gofiber/fiber/v3/middleware/cors"
  "github.com/gofiber/fiber/v3/middleware/recover"
)

func init() {
  UpdateLocationCache()

  a := fiber.New(fiber.Config{
    CaseSensitive:      true,
    Concurrency:        1024 * 1024,
    IdleTimeout:        30 * time.Second,
    DisableDefaultDate: true,
    JSONEncoder:        json.Marshal,
    JSONDecoder:        json.Unmarshal,
  })

  a.Use(cors.New())
  a.Use(recover.New(recover.Config{EnableStackTrace: os.Getenv("DEBUG") == "true"}))

  app := a.Group("/v1")

  app.Get("/locations", GetLocations)
  app.Get("/locations/timestamp", func (c fiber.Ctx) (err error) { return c.Send(utils.S2B(strconv.FormatInt(locationListCacheTimestamp.Load(), 10))) })
  app.Post("/adminApi", AdminLogin)

  withAuthValidation := app.Group("/adminApi", middleware.VerifyJWT)
  withAuthValidation.Delete("/location", DeleteLocation)

  withAuth := app.Group("/adminApi", middleware.AddJwt)
  withAuth.Put("/location", AddLocation)
  withAuth.Patch("/location", UpdateLocation)

  log.Fatal(a.Listen("0.0.0.0:8080", fiber.ListenConfig{
    EnablePrintRoutes: true,
  }))
}

