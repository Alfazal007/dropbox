package main

import (
	"fmt"
	"sync"

	"github.com/Alfazal/dropbox/auth"
	"github.com/Alfazal/dropbox/types"
	"github.com/Alfazal/dropbox/upload"
)

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

	filesBeingUploaded := types.FilesBeingUploaded{
		Mutex:       sync.RWMutex{},
		FilePaths:   []string{},
		CurFilePath: "",
	}
	wg := sync.WaitGroup{}
	wg.Add(3)
	go func() {
		defer wg.Done()
		upload.HandleUpload(&filesBeingUploaded)
	}()
	go func() {
		defer wg.Done()
		upload.UploadOneFileHash(&filesBeingUploaded, responseSignin, username)
	}()
	go func() {
		defer wg.Done()
		upload.GetWhatToSend()
	}()
	wg.Wait()
}
