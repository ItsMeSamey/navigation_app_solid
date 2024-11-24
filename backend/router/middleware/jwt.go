package middleware

import (
  "net/http"
  "time"

  "backend/db"
  "backend/helpers"

  utils "github.com/ItsMeSamey/go_utils"
  "github.com/goccy/go-json"
  "github.com/gofiber/fiber/v3"
  "github.com/kataras/jwt"
)

var JWT_SECRET = utils.S2B(helpers.Getenv("JWT_SECRET"))

// empty context needed in fiber.Ctx.SetUserContext
type emptyCtx struct{}
func (emptyCtx) Deadline() (deadline time.Time, ok bool) { return }
func (emptyCtx) Done() <-chan struct{} { return nil }
func (emptyCtx) Err() error { return nil }
func (emptyCtx) Value(key any) any { return nil }

type ContextWithJWT struct {
  emptyCtx
  UserJWT
}

type UserJWT db.Admin

func VerifyJWT(c fiber.Ctx) (err error) {
  _, err = jwt.Verify(jwt.HS256, JWT_SECRET, c.Request().Header.Peek("authorization"))
  if err != nil {
    c.Status(http.StatusNetworkAuthenticationRequired)
    return utils.WithStack(err)
  }

  return utils.WithStack(c.Next())
}

// Jwt validator
func AddJwt(c fiber.Ctx) error {
  authorization, err := jwt.Verify(jwt.HS256, JWT_SECRET, c.Request().Header.Peek("authorization"))
  if err != nil {
    c.Status(http.StatusNetworkAuthenticationRequired)
    return utils.WithStack(err)
  }
  
  var verify ContextWithJWT
  err = json.Unmarshal(authorization.Payload, &verify.UserJWT)
  if err != nil {
    return utils.WithStack(err)
  }

  c.SetUserContext(verify)
  return utils.WithStack(c.Next())
}

