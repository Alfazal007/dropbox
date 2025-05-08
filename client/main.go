package main

import (
	"fmt"
	"log"
	"sync"

	"github.com/Alfazal/dropbox/auth"
	"github.com/fsnotify/fsnotify"
)

type FilesBeingUploaded struct {
	mutex       sync.RWMutex
	filePaths   []string
	curFilePath string
}

// get all files to pull, check if any already exists if not pull
func main() {
	fmt.Println("Welcome to dropbox clone")
	signedUp := false
	signedIn := false
	var hasAccount, username, password string

	fmt.Println("Do you already have an account? yes or no, enter yes or no (full word and casing) defaults to no")
	fmt.Scanln(&hasAccount)

	if hasAccount == "yes" {
		signedUp = true
	}

	fmt.Println("Enter your username: ")
	fmt.Scanln(&username)

	fmt.Println("Enter your password: ")
	fmt.Scanln(&password)

	if !signedUp {
		signedUp = auth.Signup(username, password)
		if !signedUp {
			panic("Create another account")
		}
	}
	responseSignin := auth.Signin(username, password)
	signedIn = true
	if signedIn {
		fmt.Println(responseSignin)
	}

	filesBeingUploaded := FilesBeingUploaded{
		mutex:       sync.RWMutex{},
		filePaths:   []string{},
		curFilePath: "",
	}
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		panic(err)
	}

	defer watcher.Close()

	watcher.Add("./state/files/uploaded/")
	wg := sync.WaitGroup{}
	wg.Add(1)

	go func() {
		defer wg.Done()
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				switch event.Op {
				case fsnotify.Create:
					fmt.Println("New file")
					filesBeingUploaded.mutex.Lock()
					result := []string{}
					for _, value := range filesBeingUploaded.filePaths {
						if value != event.Name {
							result = append(result, value)
						}
					}
					filesBeingUploaded.filePaths = result
					filesBeingUploaded.filePaths = append(filesBeingUploaded.filePaths, event.Name)
					filesBeingUploaded.mutex.Unlock()
				case fsnotify.Remove:
					fmt.Println("Removed file")
					filesBeingUploaded.mutex.Lock()
					result := []string{}
					for _, value := range filesBeingUploaded.filePaths {
						if value != event.Name {
							result = append(result, value)
						}
					}
					filesBeingUploaded.filePaths = result
					filesBeingUploaded.mutex.Unlock()
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("error:", err)
			}
			fmt.Println(filesBeingUploaded.filePaths)
		}
	}()

	wg.Wait()
}
