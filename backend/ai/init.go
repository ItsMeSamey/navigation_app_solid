package ai

import (
	"backend/helpers"

	"github.com/sashabaranov/go-openai"
	"github.com/sashabaranov/go-openai/jsonschema"
)

var OpenaiClient *openai.Client

func init() {
	OpenaiClient = openai.NewClient(helpers.Getenv("OPENAI_API_KEY"))

	stringArraySchema, err := jsonschema.GenerateSchemaForType([]string{})
	if err != nil {
		panic(err)
	}

	responseFormat = &openai.ChatCompletionResponseFormat{
		Type: openai.ChatCompletionResponseFormatTypeJSONObject,
		JSONSchema: &openai.ChatCompletionResponseFormatJSONSchema{
			Name:        "Suggestions",
			Description: "array of suggested string",
			Schema:      stringArraySchema,
			Strict:      true,
		},
	}
}

