package download

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/Alfazal/dropbox/auth"
	"github.com/Alfazal/dropbox/upload"
)

func DownloadChunksSuccess(hashes []string, fileId int64, username string, userData auth.TokenSignin) bool {
	for _, hash := range hashes {
		targetFile := fmt.Sprintf("./state/files/downloaded/temp/%d/%s", fileId, hash)
		if !upload.FileExists(targetFile) {
			secureUrl := fmt.Sprintf("https://res.cloudinary.com/itachivrnft/raw/upload/dropbox/%d/%s", userData.UserId, hash)
			if err := os.MkdirAll(filepath.Dir(targetFile), 0755); err != nil {
				return false
			}
			outFile, err := os.Create(targetFile)
			if err != nil {
				return false
			}
			defer outFile.Close()
			resp, err := http.Get(secureUrl)
			if err != nil {
				return false
			}
			defer resp.Body.Close()
			_, err = io.Copy(outFile, resp.Body)
			if err != nil {
				return false
			}
		}
	}
	return true
}
