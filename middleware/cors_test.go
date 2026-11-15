package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestVersionHeaderOnSuccessAndNotFound(t *testing.T) {
	router := gin.New()
	router.Use(Version())
	router.GET("/api/status", func(c *gin.Context) { c.Status(http.StatusOK) })
	for _, target := range []string{"/api/status", "/missing"} {
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, target, nil))
		assert.Equal(t, common.Version, recorder.Header().Get("pico-api-version"))
		assert.Empty(t, recorder.Header().Get("X-New-Api-Version"))
	}
}
