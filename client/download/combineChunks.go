package download

import (
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/Alfazal/dropbox/auth"
)

func CombineChunks(hashes []string, fileId int64, username string, userData auth.TokenSignin, fileData *FileToFetchNext) bool {
	outputFilePath := fmt.Sprintf("./state/files/downloaded/%s", filepath.Base(fileData.FilePath))
	out, err := os.Create(outputFilePath)
	if err != nil {
		fmt.Println(err)
		return false
	}
	defer out.Close()
	for _, hash := range hashes {
		chunkPath := fmt.Sprintf("./state/files/downloaded/temp/%d/%s", fileId, hash)
		in, err := os.Open(chunkPath)
		if err != nil {
			fmt.Println(err)
			return false
		}
		_, err = io.Copy(out, in)
		in.Close()
		if err != nil {
			fmt.Println(err)
			return false
		}
	}
	folderToDelete := fmt.Sprintf("./state/files/downloaded/temp/%d", fileId)
	err = os.RemoveAll(folderToDelete)
	return err == nil
}
