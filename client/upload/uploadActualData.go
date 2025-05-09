package upload

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/Alfazal/dropbox/auth"
)

func GetWhatToSend() {
	for {
		time.Sleep(7 * time.Second)
	}
}

func checkIfFileExists(hash string, userData auth.TokenSignin, username string, fileId int64) bool {
	data := map[string]any{
		"fileId": fileId,
		"hash":   hash,
	}
	jsonData, _ := json.Marshal(data)
	postUrl := fmt.Sprintf("http://localhost:8002/api/v1/data/isDataPresent/%s/%s/%d", username, userData.Token, userData.MachineCount)
	res, err := http.Post(postUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return true
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		fmt.Println("Failed to upload the hash")
		return true
	}
	var isFilePresentInServer IsFilePresent
	err = json.NewDecoder(res.Body).Decode(&isFilePresentInServer)
	if err != nil {
		return true
	}
	return false
}

func sendBuffer(hashOfFile []byte, userData auth.TokenSignin, username string, fileId int64) bool {
	data := map[string]any{
		"fileId": fileId,
		"file":   hashOfFile,
	}
	jsonData, _ := json.Marshal(data)
	postUrl := fmt.Sprintf("http://localhost:8002/api/v1/data/sendData/%s/%s/%d", username, userData.Token, userData.MachineCount)
	res, err := http.Post(postUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return false
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		fmt.Println("Failed to upload the file")
		return false
	}
	var isFilePresentInServer IsFilePresent
	err = json.NewDecoder(res.Body).Decode(&isFilePresentInServer)
	if err != nil {
		return false
	}
	return false
}
