all:
	make test
	make prepare
	make linux
	make macos
	make windows
	make webapp
	make pack

prepare:
	rm -f mattermost-pr0gramm-plugin.tar.gz
	rm -rf mattermost-pr0gramm-plugin
	mkdir -p mattermost-pr0gramm-plugin
	mkdir -p mattermost-pr0gramm-plugin/client
	mkdir -p mattermost-pr0gramm-plugin/server

linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o mattermost-pr0gramm-plugin/server/plugin-linux-amd64 server/plugin.go

macos:
	CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o mattermost-pr0gramm-plugin/server/plugin-darwin-amd64 server/plugin.go

windows:
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o mattermost-pr0gramm-plugin/server/plugin-windows-amd64 server/plugin.go

webapp:
	mkdir -p dist
	npm install
	./node_modules/.bin/webpack --mode=production

pack:
	cp -r dist/main.js mattermost-pr0gramm-plugin/client
	cp plugin.json mattermost-pr0gramm-plugin/
	tar -czvf mattermost-pr0gramm-plugin.tar.gz mattermost-pr0gramm-plugin

test:
	go test ./server -v
	npm test