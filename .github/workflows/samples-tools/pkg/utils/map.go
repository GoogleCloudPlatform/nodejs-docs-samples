package utils

import (
	"sync"
)

func Map[a, b any](items []a, fn func(a) b) []b {
	var wg sync.WaitGroup
	result := make([]b, len(items))
	for i, item := range items {
		wg.Add(1)
		go func(i int, item a) {
			defer wg.Done()
			result[i] = fn(item)
		}(i, item)
	}
	wg.Wait()
	return result
}
