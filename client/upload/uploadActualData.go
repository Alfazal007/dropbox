package upload

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/Alfazal/dropbox/auth"
)

type InstructionResponse struct {
	Path   string `json:"path"`
	FileId int64  `json:"fileId"`
}

func GetWhatToSend(username string, token auth.TokenSignin) {
	for {
		time.Sleep(7 * time.Second)
		url := fmt.Sprintf("http://localhost:8002/api/v1/data/whatToSend/%s/%s/%d", username, token.Token, token.MachineCount)
		resp, err := http.Get(url)
		if err != nil {
			fmt.Println("Issue getting what to upload instructions from the server", err)
			continue
		}
		defer resp.Body.Close()
		if resp.StatusCode != 200 {
			fmt.Println("Get instructions Failed with status code ", resp.StatusCode)
			continue
		}
		var instructionGoodResponse InstructionResponse
		err = json.NewDecoder(resp.Body).Decode(&instructionGoodResponse)
		if err != nil {
			fmt.Println("Issue decoding the response into valid json", err)
			continue
		}
		if instructionGoodResponse.Path == "" {
			fmt.Println("Nothing to send to the server as instructed")
			continue
		}
		if !FileExists(instructionGoodResponse.Path) {
			deleteFileFromServer(instructionGoodResponse.FileId, username, token)
			continue
		}
		fmt.Println("Acutally need to send the hash with the file id ", instructionGoodResponse.FileId)
		sendWholeFile(instructionGoodResponse.Path, instructionGoodResponse.FileId, token, username)
	}
}

func sendWholeFile(filePath string, fileId int64, userData auth.TokenSignin, username string) {
	if !FileExists(filePath) {
		return
	}
	file, err := os.Open(filePath)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	const chunkSize = 1024
	buffer := make([]byte, chunkSize)
	for {
		bytesRead, err := file.Read(buffer)
		if err != nil && err != io.EOF {
			fmt.Println("Error reading file:", err)
			break
		}
		if bytesRead == 0 {
			break
		}
		hash := getHash(buffer)
		fileAlreadyExists, err := checkIfFileExists(hash, userData, username, fileId)
		if err != nil {
			file.Close()
			return
		}
		if !fileAlreadyExists {
			uploadResult := sendBuffer(buffer, userData, username, fileId)
			// TODO:: upload the file
		}
	}
	file.Close()
	// TODO:: send request to update the status of uploaded to true if no early return
}

func checkIfFileExists(hash string, userData auth.TokenSignin, username string, fileId int64) (bool, error) {
	data := map[string]any{
		"fileId": fileId,
		"hash":   hash,
	}
	jsonData, _ := json.Marshal(data)
	postUrl := fmt.Sprintf("http://localhost:8002/api/v1/data/isDataPresent/%s/%s/%d", username, userData.Token, userData.MachineCount)
	res, err := http.Post(postUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return false, err
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		fmt.Println("Failed to upload the hash")
		return false, err
	}
	var isFilePresentInServer IsFilePresent
	err = json.NewDecoder(res.Body).Decode(&isFilePresentInServer)
	if err != nil {
		return false, err
	}
	return isFilePresentInServer.Found, nil
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

func deleteFileFromServer(fileId int64, username string, token auth.TokenSignin) {
	data := map[string]any{
		"fileId": fileId,
	}
	jsonData, _ := json.Marshal(data)
	deleteUrl := fmt.Sprintf("http://localhost:8001/api/v1/metadata/deleteFile/%s/%s/%d", username, token.Token, token.MachineCount)
	resp, err := http.Post(deleteUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return
	}
	defer resp.Body.Close()
	fmt.Println("Delete file status is ", resp.StatusCode)
}
