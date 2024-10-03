package utils

import "sync"

func Map[a, b any](parallel bool, items []a, fn func(a) b) []b {
	result := make([]b, len(items))
	if parallel {
		var wg sync.WaitGroup
		for i, item := range items {
			wg.Add(1)
			go func(i int, item a) {
				defer wg.Done()
				result[i] = fn(item)
			}(i, item)
		}
		wg.Wait()
	} else {
		for i, item := range items {
			result[i] = fn(item)
		}
	}
	return result
}
