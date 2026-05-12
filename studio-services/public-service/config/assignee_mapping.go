package config

var AssigneeMapping = map[string]string{
	"BPA_PCO":        "BPA_HOD",
	"BPA_PCO_SIMPLE": "BPA_HOD",
	"BPA_PR":         "BPA_DIRECTOR",
	"BPA_PL":         "BPA_DIRECTOR",
	"BPA_PCS":        "BPA_DGDCF",
	"BPA_PD":         "BPA_DIRECTOR",
	"BPA_PF":         "BPA_DIRECTOR",
	"BPA_PS":         "BPA_HOD",
	"BPA_ATARR":      "BPA_DIRECTOR",
	"BPA_CCR":        "BPA_DIRECTOR",
	"BPA_CCE":        "BPA_SRA_SUB_DIRECTOR",
	"BPA_CCP":        "BPA_SDECC_SUB_DIRECTOR",
	"BPA_CCG":        "BPA_DIRECTOR",
	"BPA_PV":         "TOPOGRAPHY_HOD",
	"BPA_APE":        "BPA_SDECC_SUB_DIRECTOR",
}

func GetRoleByPermitType(permitType string) (string, bool) {
	role, ok := AssigneeMapping[permitType]
	return role, ok
}
