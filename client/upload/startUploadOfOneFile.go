package upload

import (
	"fmt"
	"time"

	"github.com/Alfazal/dropbox/types"
)

func UploadOneFile(filesBeingUploaded *types.FilesBeingUploaded) {
	for {
		time.Sleep(5 * time.Second)
		filesBeingUploaded.Mutex.Lock()
		if len(filesBeingUploaded.FilePaths) == 0 {
			fmt.Println("Nothing to upload")
		} else {
			fileToUpload := filesBeingUploaded.FilePaths[0]
			fmt.Println("File to upload")
			fmt.Println(fileToUpload)
		}
		filesBeingUploaded.Mutex.Unlock()
	}
}
