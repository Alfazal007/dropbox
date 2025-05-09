package upload

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"crypto/sha256"

	"github.com/Alfazal/dropbox/auth"
	"github.com/Alfazal/dropbox/types"
)

type CreateFileDbHash struct {
	FileId int64 `json:"fileId"`
}

type IsFilePresent struct {
	Found bool `json:"found"`
}

func UploadOneFileHash(filesBeingUploaded *types.FilesBeingUploaded, userData auth.TokenSignin, username string) {
	for {
		time.Sleep(5 * time.Second)
		filesBeingUploaded.Mutex.RLock()
		if len(filesBeingUploaded.FilePaths) == 0 {
			fmt.Println("Nothing to upload")
			filesBeingUploaded.Mutex.RUnlock()
		} else {
			fileToUpload := filesBeingUploaded.FilePaths[0]
			filesBeingUploaded.Mutex.RUnlock()
			uploadFile(fileToUpload, userData, username)
			filesBeingUploaded.Mutex.Lock()
			result := []string{}
			for _, value := range filesBeingUploaded.FilePaths {
				if value != fileToUpload {
					result = append(result, value)
				}
			}
			filesBeingUploaded.FilePaths = result
			filesBeingUploaded.Mutex.Unlock()
		}
	}
}

func uploadFile(fileToUpload string, userData auth.TokenSignin, username string) {
	file, err := os.Open(fileToUpload)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	const chunkSize = 1024
	buffer := make([]byte, chunkSize)
	var hashes []string
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
		hashes = append(hashes, hash)
	}
	file.Close()
	fmt.Println(hashes)
	_, outputCreateFile := postHashToServer(hashes, userData, username, fileToUpload)
	if !outputCreateFile {
		fmt.Println("Issue uploading the file so deleting it")
		os.Remove(fileToUpload)
		return
	}
}

func getHash(buffer []byte) string {
	hash := sha256.Sum256(buffer)
	hashString := hex.EncodeToString(hash[:])
	return string(hashString)
}

func postHashToServer(hashes []string, userData auth.TokenSignin, username string, filePath string) (int64, bool) {
	data := map[string]any{
		"filePath":     filePath,
		"hashesOfFile": hashes,
	}
	jsonData, _ := json.Marshal(data)
	postUrl := fmt.Sprintf("http://localhost:8001/api/v1/metadata/addFile/%s/%s/%d", username, userData.Token, userData.MachineCount)
	res, err := http.Post(postUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return -1, false
	}
	defer res.Body.Close()
	if res.StatusCode != 201 {
		fmt.Println("Failed to upload the hash")
		return -1, false
	}
	var response CreateFileDbHash
	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil || response.FileId == -1 {
		return -1, false
	}
	fmt.Println("Successfully uploaded the file hashes")
	return response.FileId, true
}
