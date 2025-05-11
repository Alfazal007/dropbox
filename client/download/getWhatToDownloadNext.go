package download

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/Alfazal/dropbox/auth"
)

type FileToFetchNext struct {
	FileId              int64    `json:"id"`
	UserId              int64    `json:"user_id"`
	Hashes              []string `json:"hashes"`
	FilePath            string   `json:"file_path"`
	VersionNumber       int64    `json:"version_number"`
	UploadedStatus      bool     `json:"uploaded"`
	Machine_id_Uploader int64    `json:"machine_id"`
	IsLatest            bool     `json:"isLatest"`
}

func GetWhatToDownloadNext(username string, userData auth.TokenSignin) {
	for {
		time.Sleep(5 * time.Second)
		latestPulledId := readNumber()
		fileToFetchNext, success, err := getNextToHandleFile(username, userData, latestPulledId)
		if err != nil || !success || fileToFetchNext.FileId == -1 {
			fmt.Println("Nothing to download")
			continue
		}
		DownloadChunksSuccess(fileToFetchNext.Hashes, fileToFetchNext.FileId, username, userData)
		CombineChunks(fileToFetchNext.Hashes, fileToFetchNext.FileId, username, userData, fileToFetchNext)
		writeNumber(int(fileToFetchNext.FileId))
		fmt.Println("Need to download the things of id ", fileToFetchNext)
	}
}

func readNumber() int {
	data, err := os.ReadFile("./state/latestPulledFileId.txt")
	if err != nil {
		panic(err)
	}
	str := strings.TrimSpace(string(data))
	num, err := strconv.Atoi(str)
	if err != nil {
		panic(err)
	}
	return num
}

func writeNumber(num int) {
	b := []byte(strconv.Itoa(num))
	os.WriteFile("./state/latestPulledFileId.txt", b, 0644)
}

func getNextToHandleFile(username string, userData auth.TokenSignin, lastId int) (*FileToFetchNext, bool, error) {
	data := map[string]any{
		"fileId": lastId,
	}
	jsonData, _ := json.Marshal(data)
	getNextDataUrl := fmt.Sprintf("http://localhost:8001/api/v1/metadata/nextDownload/%s/%s/%d", username, userData.Token, userData.MachineCount)
	resp, err := http.Post(getNextDataUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return nil, false, nil
	}
	var response FileToFetchNext
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil || response.FileId == -1 {
		return nil, false, nil
	}
	return &response, true, nil
}
