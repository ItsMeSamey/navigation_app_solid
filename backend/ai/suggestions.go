package ai

import (
	"context"
	"errors"

	utils "github.com/ItsMeSamey/go_utils"
	"github.com/goccy/go-json"
	openai "github.com/sashabaranov/go-openai"
)


var responseFormat *openai.ChatCompletionResponseFormat

// Generate suggestions for user text input
func Suggestions(previousChoices []string) (suggestions []string, err error) {
	data, err := json.Marshal(previousChoices)
	// Create a new chat completion
	chatCompletionRequest := openai.ChatCompletionRequest{
		Model: openai.GPT3Dot5Turbo0125,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleUser,
				Content: "Give me 10 suggestions for places that could be in a collage campus, here is a list of user's previous choices: " + utils.B2S(data),
			},
		},
		ResponseFormat: responseFormat,
		// MaxTokens:    200,
		// Temperature:  0.7,
		// TopP:         1,
		FrequencyPenalty: 0,
		PresencePenalty:  0,
		// Stop:           []string{"\n"},
	}

	chatCompletionResponse, err := OpenaiClient.CreateChatCompletion(context.Background(), chatCompletionRequest)
	if err = utils.WithStack(err); err != nil { return }

	if len(chatCompletionResponse.Choices) == 0 {
		err = utils.WithStack(errors.New("no choices found"))
	}

	err = json.Unmarshal(utils.S2B(chatCompletionResponse.Choices[0].Message.Content), &suggestions)
	if err = utils.WithStack(err); err != nil { return }

	return 
}

