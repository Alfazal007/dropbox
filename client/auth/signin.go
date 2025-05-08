package auth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type TokenSignin struct {
	Token        string `json:"id"`
	MachineCount int32  `json:"machine_count"`
	UserId       int32  `json:"user_id"`
}

func Signin(username, password string) TokenSignin {
	fmt.Println("Signin called")
	data := map[string]string{
		"username": username,
		"password": password,
	}

	jsonData, _ := json.Marshal(data)

	res, err := http.Post("http://localhost:8000/api/v1/user/signin", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)
	var responseSignin TokenSignin
	err = json.Unmarshal(body, &responseSignin)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(body))
	if res.StatusCode != 200 {
		panic("Issue signing in")
	}
	return responseSignin
}
