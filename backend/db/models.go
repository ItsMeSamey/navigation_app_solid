package db

import (
  "go.mongodb.org/mongo-driver/v2/bson"
)

var AdminMailMap = make(map[string]*Admin)
type Admin struct {
  Id bson.ObjectID `bson:"_id,omitempty" json:"id"`

  Name string `bson:"name" json:"name"`
  Mail string `bson:"mail" json:"mail"`
}

type Location struct {
  Id bson.ObjectID `bson:"_id,omitempty" json:"id"`
  Creator bson.ObjectID `bson:"creator" json:"creator"`

  Names []string `bson:"names" json:"names"`
  Misspellings []string `bson:"miss" json:"misspellings"`

  Lat  float64 `bson:"lat" json:"lat"`
  Long float64 `bson:"long" json:"long"`
}

