package auth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func Signup(username, password string) bool {
	data := map[string]string{
		"username": username,
		"password": password,
	}

	jsonData, _ := json.Marshal(data)

	res, err := http.Post("http://localhost:8000/api/v1/user/signup", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
	if res.StatusCode != 201 {
		return false
	}
	return true
}
