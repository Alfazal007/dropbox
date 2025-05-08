package upload

import (
	"fmt"
	"log"
	"os"

	"github.com/Alfazal/dropbox/types"
	"github.com/fsnotify/fsnotify"
)

func FileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func HandleUpload(filesBeingUploaded *types.FilesBeingUploaded) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		panic(err)
	}

	defer watcher.Close()

	watcher.Add("./state/files/uploaded/")
	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			switch event.Op {

			case fsnotify.Create:
				filesBeingUploaded.Mutex.Lock()
				result := []string{}
				for _, value := range filesBeingUploaded.FilePaths {
					if value != event.Name {
						result = append(result, value)
					}
				}
				filesBeingUploaded.FilePaths = result
				filesBeingUploaded.FilePaths = append(filesBeingUploaded.FilePaths, event.Name)
				filesBeingUploaded.Mutex.Unlock()

			case fsnotify.Remove:
				filesBeingUploaded.Mutex.Lock()
				result := []string{}
				for _, value := range filesBeingUploaded.FilePaths {
					if value != event.Name {
						result = append(result, value)
					}
				}
				filesBeingUploaded.FilePaths = result
				filesBeingUploaded.Mutex.Unlock()

			case fsnotify.Rename:
				filesBeingUploaded.Mutex.Lock()
				result := []string{}
				for _, value := range filesBeingUploaded.FilePaths {
					if FileExists(value) {
						result = append(result, value)
					}
				}
				filesBeingUploaded.FilePaths = result
				filesBeingUploaded.Mutex.Unlock()
			}

		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("error:", err)
		}
		fmt.Println(filesBeingUploaded.FilePaths)
	}
}
