package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/mattermost/mattermost-server/v6/plugin"
)

// Pr0grammPlugin implements the interface expected by the Mattermost server to communicate
// between the server and plugin processes.
type Pr0grammPlugin struct {
	plugin.MattermostPlugin
}

type PluginSettings struct {
	SessionCookie string `json:"cookie"`
	MaxHeight     int    `json:"maxHeight"`
	Tags          bool   `json:"tags"`
	Rating        bool   `json:"rating"`
}

type ClientSettings struct {
	MaxHeight int  `json:"maxHeight"`
	Tags      bool `json:"tags"`
	Rating    bool `json:"rating"`
}

type Pr0grammCaptcha struct {
	Token   string `json:"token"`
	Captcha string `json:"captcha"`
	Ts      int    `json:"ts"`
}

const (
	routeSettings = "/settings"
	routeInfo     = "/info"
	routeGet      = "/get"
	routeReverse  = "/reverse"
	routeLogin    = "/login"
	routeAuth     = "/auth"
)

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.

func (p *Pr0grammPlugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	_settings := p.getSettings()

	w.Header().Set("Content-Type", "application/json")

	switch path {
	case routeSettings:
		clientSettings := p.getClientSettings(w)
		p.handleClientSettingsResult(w, clientSettings)

	case routeInfo:
		resp, err := p.itemsInfo(w, r, _settings)
		p.handleRequestResult(w, resp, err)

	case routeGet:
		resp, err := p.itemsGet(w, r, _settings)
		p.handleRequestResult(w, resp, err)

	case routeReverse:
		resp, err := p.itemsReverse(w, r, _settings)
		p.handleRequestResult(w, resp, err)

	/*
		case routeLogin:
			w.Header().Set("Content-Type", "text/html")
			resp, err := p.captchaGet(w)
			p.handlLoginRequestResult(w, resp, err)

		case routeAuth:
			login := p.getPr0grammLogin(r)
			resp, err := p.login(w, login)
			p.handleRequestResult(w, resp, err)
	*/

	default:
		resp, err := p.any(w, r, _settings)
		p.handleRequestResult(w, resp, err)
	}
}

func (p *Pr0grammPlugin) getSettings() PluginSettings {
	pluginSettings, ok := p.API.GetConfig().PluginSettings.Plugins["pr0gramm"]
	if !ok {
		return p.getDefaultSettings()
	}

	settings := PluginSettings{
		SessionCookie: p.getStrVal(pluginSettings["cookie"]),
		MaxHeight:     p.getIntVal(pluginSettings["maxheight"]),
		Tags:          p.getBoolVal(pluginSettings["tags"]),
		Rating:        p.getBoolVal(pluginSettings["rating"]),
	}

	return settings
}

func (p *Pr0grammPlugin) getClientSettings(w http.ResponseWriter) ClientSettings {
	pluginSettings, ok := p.API.GetConfig().PluginSettings.Plugins["pr0gramm"]
	if !ok {
		return p.getDefaultClientSettings()
	}

	settings := ClientSettings{
		MaxHeight: p.getIntVal(pluginSettings["maxheight"]),
		Tags:      p.getBoolVal(pluginSettings["tags"]),
		Rating:    p.getBoolVal(pluginSettings["rating"]),
	}

	return settings
}

func (p *Pr0grammPlugin) getDefaultSettings() PluginSettings {
	return PluginSettings{
		MaxHeight:     400,
		Tags:          true,
		Rating:        true,
		SessionCookie: "",
	}
}

func (p *Pr0grammPlugin) getDefaultClientSettings() ClientSettings {
	return ClientSettings{
		MaxHeight: 400,
		Tags:      true,
		Rating:    true,
	}
}

func (p *Pr0grammPlugin) getStrVal(v interface{}) string {
	val, ok := v.(string)
	if !ok {
		val = ""
	}
	return val
}

func (p *Pr0grammPlugin) getBoolVal(v interface{}) bool {
	val, ok := v.(bool)
	if !ok {
		val = true
	}
	return val
}

func (p *Pr0grammPlugin) getIntVal(v interface{}) int {
	val, ok := v.(int)
	if !ok {
		val = 400
	}
	return val
}

func (p *Pr0grammPlugin) handleRequestResult(w http.ResponseWriter, resp *http.Response, err error) {
	if err != nil {
		fmt.Fprintf(w, `{"error": "%s"}`, err.Error())
	} else {
		response := p.handleResponse(resp)
		if response == "error" {
			fmt.Fprint(w, `{ "error": "pr0gramm http request error"}`)
		} else {
			fmt.Fprint(w, response)
		}
	}
}

func (p *Pr0grammPlugin) handleClientSettingsResult(w http.ResponseWriter, settings ClientSettings) {
	json, err := json.Marshal(&settings)
	if err != nil {
		fmt.Fprint(w, "{\"error\": \"serialization error\"}")
	}
	fmt.Fprint(w, string(json))
}

/* Handle pr0gramm items/info requests (tags, comments)
 */
func (p *Pr0grammPlugin) itemsInfo(w http.ResponseWriter, r *http.Request, settings PluginSettings) (*http.Response, error) {
	url := "https://pr0gramm.com/api/items/info?itemId=" + r.URL.Query().Get("id")

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	if settings.SessionCookie != "" {
		req.Header.Set("Cookie", settings.SessionCookie)
	}
	client := &http.Client{}
	return client.Do(req)

	// return http.Get("https://pr0gramm.com/api/items/info?itemId=" +
	//	r.URL.Query().Get("id"))
}

/* Handle pr0gramm items/get requests (file url etc.)
 */
func (p *Pr0grammPlugin) itemsGet(w http.ResponseWriter, r *http.Request, settings PluginSettings) (*http.Response, error) {
	url := "https://pr0gramm.com/api/items/get?flags=31&id=" + r.URL.Query().Get("id")

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	if settings.SessionCookie != "" {
		req.Header.Set("Cookie", settings.SessionCookie)
	}
	client := &http.Client{}
	return client.Do(req)
}

/* Handle pr0gramm items/get requests (file url etc.)
 */
func (p *Pr0grammPlugin) itemsReverse(w http.ResponseWriter, r *http.Request, settings PluginSettings) (*http.Response, error) {
	url := "https://pr0gramm.com/api/items/get?flags=31&tags=!p%3A" + r.URL.Query().Get("fileUrl")

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	if settings.SessionCookie != "" {
		req.Header.Set("Cookie", settings.SessionCookie)
	}
	client := &http.Client{}
	return client.Do(req)
}

func (p *Pr0grammPlugin) any(w http.ResponseWriter, r *http.Request, settings PluginSettings) (*http.Response, error) {
	url := "https://pr0gramm.com/api/" + r.URL.Query().Get("any")

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	if settings.SessionCookie != "" {
		req.Header.Set("Cookie", settings.SessionCookie)
	}
	client := &http.Client{}
	return client.Do(req)
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
