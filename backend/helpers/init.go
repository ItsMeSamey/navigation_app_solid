package helpers

import (
  "log"
  "os"

  utils "github.com/ItsMeSamey/go_utils"
)

func init() {
  utils.Load(".env", func(key, value string) error {
    log.Println(key, "=", value)
    return os.Setenv(key, value)
  })

  if os.Getenv("DEBUG") == "true" {
    utils.SetErrorStackTrace(true)
  }
}

