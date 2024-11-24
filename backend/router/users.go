package router

import (
  "github.com/gofiber/fiber/v3"
) 

func GetLocations(c fiber.Ctx) (err error) {
  return c.Send(*locationListCache.Load())
}

