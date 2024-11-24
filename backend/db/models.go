package db

import (
  "go.mongodb.org/mongo-driver/v2/bson"
)

type Admin struct {
  Id bson.ObjectID `bson:"_id" json:"id"`

  Name string `bson:"name" json:"name"`
  Mail string `bson:"mail" json:"mail"`
}

type Location struct {
  Id bson.ObjectID `bson:"_id"`

  Names []string `bson:"names" json:"names"`

  Lati float64 `bson:"lati" json:"lati"`
  Long float64 `bson:"long" json:"long"`
}

