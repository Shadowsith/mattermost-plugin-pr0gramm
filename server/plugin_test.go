package main

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestGetIntVal(t *testing.T) {
	plugin := &Pr0grammPlugin{}

	// Test with an integer value
	val := 100
	result := plugin.getIntVal(val)
	expected := 100
	if result != expected {
		t.Errorf("getIntVal(%d) returned %d, expected %d", val, result, expected)
	}

	// Test with a non-integer value
	val1 := "not an integer"
	result = plugin.getIntVal(val1)
	expected = 400
	if result != expected {
		t.Errorf("getIntVal(%s) returned %d, expected %d", val1, result, expected)
	}
}

func TestGetBoolVal(t *testing.T) {
	plugin := &Pr0grammPlugin{}

	// Test with a boolean value
	val := true
	result := plugin.getBoolVal(val)
	expected := true
	if result != expected {
		t.Errorf("getBoolVal(%t) returned %t, expected %t", val, result, expected)
	}

	// Test with a non-boolean value
	val1 := "not a boolean"
	result = plugin.getBoolVal(val1)
	expected = true
	if result != expected {
		t.Errorf("getBoolVal(%s) returned %t, expected %t", val1, result, expected)
	}
}

func TestGetStrVal(t *testing.T) {
	plugin := &Pr0grammPlugin{}

	// Test with a string value
	val := "test string"
	result := plugin.getStrVal(val)
	expected := "test string"
	if result != expected {
		t.Errorf("getStrVal(%s) returned %s, expected %s", val, result, expected)
	}

	// Test with a non-string value
	val1 := 12345
	result = plugin.getStrVal(val1)
	expected = ""
	if result != expected {
		t.Errorf("getStrVal(%d) returned %s, expected %s", val1, result, expected)
	}
}

func TestHandleResponse(t *testing.T) {
	// create a new Pr0grammPlugin instance
	plugin := &Pr0grammPlugin{}

	// create a new http.Response instance with a status code of 200 and a response body
	responseBody := "Test response body"
	resp := &http.Response{
		StatusCode: http.StatusOK,
		Body:       io.NopCloser(strings.NewReader(responseBody)),
	}

	// call the handleResponse function and check if the returned string matches the response body
	expected := responseBody
	result := plugin.handleResponse(resp)
	if result != expected {
		t.Errorf("handleResponse returned '%s', expected '%s'", result, expected)
	}

	// create a new http.Response instance with a status code of 404
	resp = &http.Response{
		StatusCode: http.StatusNotFound,
		Body:       io.NopCloser(strings.NewReader("")),
	}

	// call the handleResponse function and check if the returned string is 'error'
	expected = "error"
	result = plugin.handleResponse(resp)
	if result != expected {
		t.Errorf("handleResponse returned '%s', expected '%s'", result, expected)
	}
}

func TestHandleRequestResult(t *testing.T) {
	// Create a mock response
	responseBody := `{"foo": "bar"}`
	response := &http.Response{
		StatusCode: 200,
		Body:       ioutil.NopCloser(strings.NewReader(responseBody)),
	}

	// Test with no error
	w := httptest.NewRecorder()
	p := &Pr0grammPlugin{}
	p.handleRequestResult(w, response, nil)
	expected := responseBody
	result := strings.TrimSpace(w.Body.String())
	if result != expected {
		t.Errorf("handleRequestResult returned %q, expected %q", result, expected)
	}

	// Test with error
	w = httptest.NewRecorder()
	p.handleRequestResult(w, response, errors.New("some error"))
	expected = `{"error": "some error"}`
	result = strings.TrimSpace(w.Body.String())
	if result != expected {
		t.Errorf("handleRequestResult returned %q, expected %q", result, expected)
	}

	// Test with response "error"
	responseBody = `{"error": "some error"}`
	response = &http.Response{
		StatusCode: 400,
		Body:       ioutil.NopCloser(strings.NewReader(responseBody)),
	}
	w = httptest.NewRecorder()
	p.handleRequestResult(w, response, nil)
	expected = `{ "error": "pr0gramm http request error"}`
	result = strings.TrimSpace(w.Body.String())
	fmt.Print(result)
	if result != expected {
		t.Errorf("handleRequestResult returned %q, expected %q", result, expected)
	}
}
