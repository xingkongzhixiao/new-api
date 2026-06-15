package controller

import (
	"net/http"

	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting"
	ratio_setting "github.com/QuantumNous/new-api/setting/ratio_setting"

	"github.com/gin-gonic/gin"
)

func GetGroups(c *gin.Context) {
	groupNames := make([]string, 0)
	for groupName := range setting.GetUserUsableGroupsCopy() {
		if groupName != "auto" {
			groupNames = append(groupNames, groupName)
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    groupNames,
	})
}

// GetSubscriptionGroups returns subscription (user) groups from GroupRatio.
// Used by admin when editing a user's subscription group.
func GetSubscriptionGroups(c *gin.Context) {
	groupNames := make([]string, 0)
	for name := range ratio_setting.GetGroupRatioCopy() {
		groupNames = append(groupNames, name)
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    groupNames,
	})
}

func GetUserGroups(c *gin.Context) {
	usableGroups := make(map[string]map[string]interface{})
	userGroup := ""
	userId := c.GetInt("id")
	userGroup, _ = model.GetUserGroup(userId, false)
	userUsableGroups := service.GetUserUsableGroups(userGroup)
	for groupName, desc := range userUsableGroups {
		if groupName == "auto" {
			continue
		}
		usableGroups[groupName] = map[string]interface{}{
			"ratio": service.GetUserGroupRatio(userGroup, groupName),
			"desc":  desc,
		}
	}
	if _, ok := userUsableGroups["auto"]; ok {
		usableGroups["auto"] = map[string]interface{}{
			"ratio": "自动",
			"desc":  setting.GetUsableGroupDescription("auto"),
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message":    "",
		"data":       usableGroups,
		"user_group": userGroup,
	})
}
