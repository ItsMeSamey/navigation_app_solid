package helpers

import (
  "log"
  "os"
)

func Getenv(key string) string {
  val, ok := os.LookupEnv(key)
  if !ok {
    log.Fatal("env ", key, " not found")
  }
  return val
}

