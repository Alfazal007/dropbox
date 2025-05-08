package types

import "sync"

type FilesBeingUploaded struct {
	Mutex       sync.RWMutex
	FilePaths   []string
	CurFilePath string
}
