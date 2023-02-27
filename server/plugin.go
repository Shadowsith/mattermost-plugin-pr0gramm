package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/mattermost/mattermost-server/v6/plugin"
)

// Pr0grammPlugin implements the interface expected by the Mattermost server to communicate
// between the server and plugin processes.
type Pr0grammPlugin struct {
	plugin.MattermostPlugin
}

type PluginSettings struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	MaxHeight int    `json:"maxHeight"`
	Tags      bool   `json:"tags"`
	Rating    bool   `json:"rating"`
}

type ClientSettings struct {
	MaxHeight int  `json:"maxHeight"`
	Tags      bool `json:"tags"`
	Rating    bool `json:"rating"`
}

const (
	routeSettings = "/settings"
	routeInfo     = "/info"
	routeGet      = "/get"
	routeReverse  = "/reverse"
)

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
func (p *Pr0grammPlugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	w.Header().Set("Content-Type", "application/json")

	switch path {
	case routeSettings:
		clientSettings := p.getClientSettings(w)
		// fmt.Fprint(w, clientSettings.maxHeightStr)
		p.handleClientSettingsResult(w, clientSettings)
		break

	case routeInfo:
		resp, err := p.itemsInfo(w, r)
		p.handleRequestResult(w, resp, err)
		break

	case routeGet:
		resp, err := p.itemsGet(w, r)
		p.handleRequestResult(w, resp, err)
		break

	case routeReverse:
		resp, err := p.itemsReverse(w, r)
		p.handleRequestResult(w, resp, err)
		break

	default:
		resp, err := p.any(w, r)
		p.handleRequestResult(w, resp, err)
		break
	}
}

func (p *Pr0grammPlugin) getSettings() *PluginSettings {
	pluginSettings, ok := p.API.GetConfig().PluginSettings.Plugins["pr0gramm"]
	settings := new(PluginSettings)
	if ok {
		for k, v := range pluginSettings {
			if k == "username" {
				settings.Username = v.(string)
			} else if k == "password" {
				settings.Password = v.(string)
			} else if k == "maxheight" {
				maxHeight, err := strconv.Atoi(
					fmt.Sprintf("%v", v))
				if err != nil {
					log.Fatal(err)
				}
				settings.MaxHeight = maxHeight
			} else if k == "tags" {
				val, ok := v.(bool)
				if !ok {
					val = false
				}
				settings.Tags = val
			} else if k == "rating" {
				val, ok := v.(bool)
				if !ok {
					val = false
				}
				settings.Rating = val
			}
		}
	}
	return settings
}

func (p *Pr0grammPlugin) getClientSettings(w http.ResponseWriter) *ClientSettings {
	pluginSettings, ok := p.API.GetConfig().PluginSettings.Plugins["pr0gramm"]
	settings := new(ClientSettings)
	if ok {
		for k, v := range pluginSettings {
			if k == "maxheight" {
				maxHeight, err := strconv.Atoi(
					fmt.Sprintf("%v", v))
				if err != nil {
					log.Fatal(err)
				}
				settings.MaxHeight = maxHeight
			} else if k == "tags" {
				val, ok := v.(bool)
				if !ok {
					val = false
				}
				settings.Tags = val
			} else if k == "rating" {
				val, ok := v.(bool)
				if !ok {
					val = false
				}
				settings.Rating = val
			}
		}
	}
	return settings
}

func (p *Pr0grammPlugin) handleRequestResult(w http.ResponseWriter, resp *http.Response, err error) {
	if err != nil {
		fmt.Fprint(w, "{ \"error\":\""+err.Error()+"\"}")
	} else {
		response := p.handleResponse(resp)
		if response == "error" {
			fmt.Fprint(w, "{ \"error\":\"pr0gramm http request error \"}")
		} else {
			clientSettings := p.getClientSettings(w)
			response = strings.TrimRight(response, "}")
			fmt.Fprint(w, p.addClientSettingsToResult(w, response, clientSettings))
		}
	}
}

func (p *Pr0grammPlugin) addClientSettingsToResult(w http.ResponseWriter, response string, settings *ClientSettings) string {
	json, err := json.Marshal(&settings)
	if err != nil {
		return response
	} else {
		if string(json) != "{}" {
			return strings.TrimRight(response, "}") + ", \"clientSettings\": " + string(json) + "}"
		} else {
			return response
		}
	}
}

func (p *Pr0grammPlugin) handleClientSettingsResult(w http.ResponseWriter, settings *ClientSettings) {
	json, err := json.Marshal(&settings)
	if err != nil {
		fmt.Fprint(w, "{\"error\": \"serialization error\"}")
	}
	fmt.Fprint(w, string(json))
}

/* Handle pr0gramm items/info requests (tags, comments)
 */
func (p *Pr0grammPlugin) itemsInfo(w http.ResponseWriter, r *http.Request) (*http.Response, error) {
	return http.Get("https://pr0gramm.com/api/items/info?itemId=" +
		r.URL.Query().Get("id"))
}

/* Handle pr0gramm items/get requests (file url etc.)
 */
func (p *Pr0grammPlugin) itemsGet(w http.ResponseWriter, r *http.Request) (*http.Response, error) {
	return http.Get("https://pr0gramm.com/api/items/get?id=" +
		r.URL.Query().Get("id"))
}

/* Handle pr0gramm items/get requests (file url etc.)
 */
func (p *Pr0grammPlugin) itemsReverse(w http.ResponseWriter, r *http.Request) (*http.Response, error) {
	return http.Get("https://pr0gramm.com/api/items/get?tags=!p%3A" +
		r.URL.Query().Get("fileUrl"))
}

func (p *Pr0grammPlugin) any(w http.ResponseWriter, r *http.Request) (*http.Response, error) {
	return http.Get("https://pr0gramm.com/api/" + r.URL.Query().Get("any"))
}

func (p *Pr0grammPlugin) handleResponse(resp *http.Response) string {
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusOK {
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatal(err)
			return "error"
		}
		return string(bodyBytes)
	}
	return "error"
}

// This example demonstrates a plugin that handles HTTP requests which respond by greeting the
// world.
func main() {
	plugin.ClientMain(&Pr0grammPlugin{})
}
