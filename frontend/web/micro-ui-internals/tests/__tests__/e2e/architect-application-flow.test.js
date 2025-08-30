import '@testing-library/jest-dom';

// API Configuration from flow.md
const API_BASE_URL = 'https://djibouti.tekdinext.com';
const TENANT_ID = 'dj';
const SERVICE_CODE = 'SVC-DJ-BPA-BPA_PCO-02';

// Test data from flow.md
const TEST_APPLICATION_DATA = {
    applicants: [{
        name: "Rex",
        mobileNumber: 77475869,
        emailId: "user1@example.com",
        prefix: "253",
        type: "CITIZEN"
    }],
    serviceDetails: {
        landandProjectDesignDetails: [{
            siteLocation: "",
            region: "BPA_REGION_REGION_TADJOURAH",
            area: "200",
            legalStatus: "",
            definitiveLandTitle: "",
            tfNo: "",
            registrationCertificate: "",
            other: "",
            workType: "BPA_WORKTYPE_WORKTYPE_HOUSING",
            noOfUnits: "",
            detailsOnOtherType: "",
            maximumAuthorizedCes: "1",
            prjectedCes: "1",
            maximumAuthorizedCos: "1",
            projectedCos: "1",
            coveredProjectArea: "1",
            constructionCostPerSqMt: "1"
        }],
        designOfficeDetailing: [{
            nameOfDesignOffice: "test",
            architectName: "test",
            telephone: "77475869",
            officeEmail: "test@gmail.com",
            registrationNo: "",
            registrationNoOnProfessionalRoll: ""
        }]
    },
    address: {
        tenantId: "dj",
        latitude: 0,
        longitude: 0,
        addressNumber: "1",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        city: "",
        hierarchyType: "REVENUE",
        boundarylevel: "locality",
        boundarycode: "dj.city"
    },
    additionalDetails: {
        applicants: {
            wayToAddress: "COMMON-MASTERS_GENDERTYPE_WAYTOADDRESS_MALE",
            address: "abcd",
            nationalIdNumber: "1234567890",
            eligibilityDeclaration: true,
            accuracyDeclaration: true,
            taxCalculationAgreement: true,
            checkValidation: true,
            idType: "BPA_IDENTITYTYPE_IDTYPE_PASSPORT"
        }
    }
};

// Login function to get real auth token and user info using OTP
const loginAndGetAuthInfo = async () => {
    // Step 1: Send OTP
    console.log('   Sending OTP to 77335577...');
    const sendOtpUrl = `${API_BASE_URL}/user/v1/_send_otp`;

    const otpRequestBody = {
        otp: {
            mobileNumber: "77335577",
            tenantId: TENANT_ID,
            type: "login",
            userType: "CITIZEN"
        },
        RequestInfo: {
            apiId: "Rainmaker",
            authToken: "",
            userInfo: null,
            msgId: `${Date.now()}|en_IN`,
            plainAccessRequest: {}
        }
    };

    const otpResponse = await fetch(sendOtpUrl, {
        method: 'POST',
        headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'content-type': 'application/json;charset=UTF-8',
            'origin': API_BASE_URL,
            'referer': `${API_BASE_URL}/digit-studio/citizen/login`,
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
        },
        body: JSON.stringify(otpRequestBody)
    });

    if (!otpResponse.ok) {
        throw new Error(`Send OTP failed! status: ${otpResponse.status}`);
    }

    const otpResult = await otpResponse.json();
    console.log('   ✓ OTP sent successfully');

    // Step 2: Verify OTP and authenticate
    console.log('   Verifying OTP: 123456...');
    const verifyOtpUrl = `${API_BASE_URL}/user/v1/_authenticate`;

    const verifyRequestBody = {
        username: "77335577",
        password: "123456",
        tenantId: TENANT_ID,
        userType: "CITIZEN",
        RequestInfo: {
            apiId: "Rainmaker",
            authToken: "",
            userInfo: null,
            msgId: `${Date.now()}|en_IN`,
            plainAccessRequest: {}
        }
    };

    const verifyResponse = await fetch(verifyOtpUrl, {
        method: 'POST',
        headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'content-type': 'application/json;charset=UTF-8',
            'origin': API_BASE_URL,
            'referer': `${API_BASE_URL}/digit-studio/citizen/login`,
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
        },
        body: JSON.stringify(verifyRequestBody)
    });

    if (!verifyResponse.ok) {
        throw new Error(`OTP verification failed! status: ${verifyResponse.status}`);
    }

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.access_token) {
        throw new Error('OTP verification failed - no access token received');
    }

    console.log('   ✓ OTP verified successfully');

    return {
        authToken: verifyResult.access_token,
        userInfo: verifyResult.UserRequest,
        responseInfo: verifyResult.ResponseInfo
    };
};

// API Helper Functions
const apiRequest = async (url, options = {}) => {
    const defaultHeaders = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/json;charset=UTF-8',
        'x-tenant-id': TENANT_ID,
        'origin': API_BASE_URL,
        'referer': `${API_BASE_URL}/digit-studio/citizen/publicservices/BPA/BPA_PCO/Apply?serviceCode=${SERVICE_CODE}`,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

// Helper function to upload multiple files in parallel
const uploadMultipleFiles = async (files, authToken) => {
    const uploadPromises = files.map(async (file) => {
        const url = `${API_BASE_URL}/filestore/v1/files`;
        const formData = new FormData();
        formData.append('file', new Blob([file.content], { type: file.type }), file.name);
        formData.append('tenantId', TENANT_ID);
        formData.append('module', 'DigitStudio');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'auth-token': authToken,
                'origin': API_BASE_URL,
                'referer': `${API_BASE_URL}/digit-studio/citizen/publicservices/BPA/BPA_PCO/Apply?serviceCode=${SERVICE_CODE}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`File upload failed for ${file.name}! status: ${response.status}`);
        }

        const result = await response.json();
        return {
            fileName: file.name,
            fileStoreId: result.files[0].fileStoreId,
            documentType: file.documentType
        };
    });

    return Promise.all(uploadPromises);
};

describe('Architect Application E2E Flow - Sequential Execution', () => {
    // Set longer timeout for API calls
    beforeAll(() => {
        jest.setTimeout(60000);
    });

    test('Sequential E2E Flow with Parallel File Uploads', async () => {
        console.log('\n🚀 Starting Sequential Architect Application E2E Flow...\n');

        // STEP 0: Architect OTP Login and get real auth token and user info
        console.log('Step 0: Authenticating architect user with OTP...');
        const authInfo = await loginAndGetAuthInfo();

        expect(authInfo.authToken).toBeDefined();
        expect(authInfo.userInfo).toBeDefined();
        expect(authInfo.userInfo.id).toBeDefined();
        expect(authInfo.userInfo.uuid).toBeDefined();

        console.log(`✓ Step 0: Successfully authenticated architect: ${authInfo.userInfo.name} (${authInfo.userInfo.userName})`);
        console.log(`✓ Auth token: ${authInfo.authToken.substring(0, 10)}...`);
        console.log(`✓ User roles: ${authInfo.userInfo.roles.map(r => r.name).join(', ')}`);

        // STEP 1: Search for permits service (Sequential)
        console.log('Step 1: Searching for permits service...');
        const servicesUrl = `${API_BASE_URL}/public-service/v1/service?tenantId=${TENANT_ID}`;
        const servicesResponse = await apiRequest(servicesUrl);

        expect(servicesResponse).toBeDefined();
        expect(servicesResponse.Services).toBeDefined();

        const bpaService = servicesResponse.Services.find(service =>
            service.serviceCode === SERVICE_CODE
        );
        expect(bpaService).toBeDefined();
        expect(bpaService.serviceCode).toBe(SERVICE_CODE);

        console.log('✓ Step 1: Successfully found BPA_PCO service');

        // STEP 2: Get MDMS data for dropdowns (Sequential)
        console.log('Step 2: Fetching MDMS configuration...');
        const mdmsUrl = `${API_BASE_URL}/egov-mdms-service/v2/_search`;
        const mdmsResponse = await apiRequest(mdmsUrl, {
            method: 'POST',
            body: JSON.stringify({
                MdmsCriteria: {
                    tenantId: TENANT_ID,
                    schemaCode: "Studio.ServiceConfiguration",
                    filters: { module: "BPA" }
                }
            })
        });

        expect(mdmsResponse).toBeDefined();
        expect(mdmsResponse.mdms).toBeDefined();

        console.log('✓ Step 2: Successfully retrieved MDMS data');

        // STEP 3: Get workflow configuration (Sequential)
        console.log('Step 3: Fetching workflow configuration...');
        const workflowUrl = `${API_BASE_URL}/egov-workflow-v2/egov-wf/businessservice/_search?tenantId=${TENANT_ID}&businessServices=BPA_PCO`;
        const workflowResponse = await apiRequest(workflowUrl);

        expect(workflowResponse).toBeDefined();
        expect(workflowResponse.BusinessServices).toBeDefined();
        expect(workflowResponse.BusinessServices.length).toBeGreaterThan(0);

        const bpaWorkflow = workflowResponse.BusinessServices.find(bs => bs.businessService === 'BPA_PCO');
        expect(bpaWorkflow).toBeDefined();

        console.log('✓ Step 3: Successfully retrieved workflow configuration');

        // STEP 4: Create DRAFT application (Sequential)
        console.log('Step 4: Creating DRAFT application...');
        const draftUrl = `${API_BASE_URL}/public-service/v1/application/${SERVICE_CODE}`;
        const draftBody = {
            Application: {
                id: null,
                applicationNumber: "",
                serviceCode: null,
                tenantId: TENANT_ID,
                module: "BPA",
                businessService: "BPA_PCO",
                status: "ACTIVE",
                channel: "counter",
                workflowStatus: "applied",
                serviceDetails: TEST_APPLICATION_DATA.serviceDetails,
                applicants: TEST_APPLICATION_DATA.applicants.map(applicant => ({
                    ...applicant,
                    id: null,
                    userId: ""
                })),
                address: TEST_APPLICATION_DATA.address,
                documents: [],
                additionalDetails: TEST_APPLICATION_DATA.additionalDetails,
                Workflow: {
                    action: "DRAFT",
                    comment: "",
                    assignees: [],
                    businessService: "BPA_PCO"
                }
            },
            RequestInfo: {
                apiId: "Rainmaker",
                authToken: authInfo.authToken,
                userInfo: authInfo.userInfo,
                msgId: `${Date.now()}|en_IN`,
                plainAccessRequest: {}
            }
        };

        const draftResponse = await apiRequest(draftUrl, {
            method: 'POST',
            body: JSON.stringify(draftBody)
        });

        expect(draftResponse).toBeDefined();
        expect(draftResponse.Application).toBeDefined();
        expect(draftResponse.Application.applicationNumber).toBeDefined();
        expect(draftResponse.Application.id).toBeDefined();

        const createdAppNumber = draftResponse.Application.applicationNumber;
        const createdAppId = draftResponse.Application.id;

        console.log(`✓ Step 4: Successfully created DRAFT application: ${createdAppNumber}`);

        // STEP 5: Upload multiple documents in PARALLEL
        console.log('Step 5: Uploading documents in parallel...');

        // Define multiple files to upload
        const filesToUpload = [
            {
                name: 'land-title.pdf',
                content: 'Land title document content for BPA application',
                type: 'application/pdf',
                documentType: 'BPA_BPA_PCO_DOCUMENTS_PCO_LAND_TITLE_UPLOAD'
            },
            {
                name: 'architect-certificate.pdf',
                content: 'Architect certificate document content',
                type: 'application/pdf',
                documentType: 'BPA_BPA_PCO_DOCUMENTS_PCO_ARCHITECT_CERTIFICATE'
            },
            {
                name: 'project-plans.pdf',
                content: 'Project architectural plans document',
                type: 'application/pdf',
                documentType: 'BPA_BPA_PCO_DOCUMENTS_PCO_PROJECT_PLANS'
            },
            {
                name: 'identity-proof.pdf',
                content: 'Identity proof document for applicant',
                type: 'application/pdf',
                documentType: 'BPA_BPA_PCO_DOCUMENTS_PCO_IDENTITY_PROOF'
            }
        ];

        // Upload all files in parallel
        const uploadedFiles = await uploadMultipleFiles(filesToUpload, authInfo.authToken);

        expect(uploadedFiles).toBeDefined();
        expect(uploadedFiles.length).toBe(filesToUpload.length);

        uploadedFiles.forEach((file, index) => {
            expect(file.fileStoreId).toBeDefined();
            expect(file.fileName).toBe(filesToUpload[index].name);
            console.log(`✓ File uploaded: ${file.fileName} → ${file.fileStoreId}`);
        });

        console.log(`✓ Step 5: Successfully uploaded ${uploadedFiles.length} documents in parallel`);

        // STEP 6: Submit final application with CREATE action (Sequential)
        console.log('Step 6: Submitting final application...');

        // Get assignees (BPA HODs)
        const assignees = [
            {
                id: 1915,
                uuid: "4ac57cd5-690e-4f47-a275-2c612b91b8dd",
                userName: "zahrahoumed91@gmail.com",
                name: "ZAHRA MOHAMED HOUMAD",
                mobileNumber: "77654654",
                emailId: "zahrahoumed91@gmail.com",
                type: "EMPLOYEE",
                roles: [{ name: "BPA HOD", code: "BPA_HOD", tenantId: TENANT_ID }]
            },
            {
                id: 1914,
                uuid: "7e846de3-bd0f-4b60-9d9e-fe42e1cb8beb",
                userName: "nafissaelfarah@gmail.com",
                name: "NAFISSA AIFARAH CHARIF",
                mobileNumber: "77654654",
                emailId: "nafissaelfarah@gmail.com",
                type: "EMPLOYEE",
                roles: [{ name: "BPA HOD", code: "BPA_HOD", tenantId: TENANT_ID }]
            },
            {
                id: 1916,
                uuid: "41b405ce-abef-4cab-b0ec-baf9c5fd6ed6",
                userName: "yacinahmedmohamed@gmail.com",
                name: "YACIN AHMED MOHAMED",
                mobileNumber: "77654654",
                emailId: "yacinahmedmohamed@gmail.com",
                type: "EMPLOYEE",
                roles: [{ name: "BPA HOD", code: "BPA_HOD", tenantId: TENANT_ID }]
            }
        ];

        const submitBody = {
            Application: {
                id: createdAppId,
                applicationNumber: createdAppNumber,
                serviceCode: SERVICE_CODE,
                tenantId: TENANT_ID,
                module: "BPA",
                businessService: "BPA_PCO",
                status: "ACTIVE",
                channel: "counter",
                workflowStatus: "applied",
                serviceDetails: {
                    ...TEST_APPLICATION_DATA.serviceDetails,
                    applicationNumber: createdAppNumber
                },
                applicants: [{
                    type: "CITIZEN",
                    name: "Rex",
                    mobileNumber: 77475869,
                    emailId: "user1@example.com",
                    prefix: "253",
                    active: true,
                    userId: "IND-2025-05-31-000174"
                }],
                address: TEST_APPLICATION_DATA.address,
                documents: uploadedFiles.map(file => ({
                    documentType: file.documentType,
                    fileStoreId: file.fileStoreId,
                    documentUid: null,
                    additionalDetails: {}
                })),
                additionalDetails: TEST_APPLICATION_DATA.additionalDetails,
                Workflow: {
                    action: "CREATE",
                    comment: "",
                    assignees: assignees,
                    businessService: "BPA_PCO"
                }
            },
            RequestInfo: {
                apiId: "Rainmaker",
                authToken: authInfo.authToken,
                userInfo: authInfo.userInfo,
                msgId: `${Date.now()}|en_IN`
            }
        };

        const submitResponse = await apiRequest(draftUrl, {
            method: 'PUT',
            body: JSON.stringify(submitBody)
        });

        expect(submitResponse).toBeDefined();
        expect(submitResponse.Application).toBeDefined();
        expect(submitResponse.Application.applicationNumber).toBe(createdAppNumber);
        expect(submitResponse.Application.workflow).toBeDefined();
        expect(submitResponse.Application.workflow.action).toBe("CREATE");

        // Verify assignees are set
        expect(submitResponse.Application.workflow.assignees).toBeDefined();
        expect(submitResponse.Application.workflow.assignees.length).toBeGreaterThan(0);

        console.log(`✓ Step 6: Successfully submitted application ${createdAppNumber} with CREATE action`);
        console.log(`✓ Application assigned to ${submitResponse.Application.workflow.assignees.length} BPA HODs`);

        console.log('\n🎉 Sequential E2E Flow Successfully Completed!\n');

        // Summary
        console.log('📋 Flow Summary:');
        console.log(`   • Authenticated Architect: ${authInfo.userInfo.name} (${authInfo.userInfo.userName})`);
        console.log(`   • User Roles: ${authInfo.userInfo.roles.map(r => r.name).join(', ')}`);
        console.log(`   • Login Method: OTP (77335577 / 123456)`);
        console.log(`   • Service searched: ${SERVICE_CODE}`);
        console.log(`   • MDMS data retrieved: ✓`);
        console.log(`   • Workflow configuration: ✓`);
        console.log(`   • Application created: ${createdAppNumber}`);
        console.log(`   • Documents uploaded (parallel): ${uploadedFiles.length} files`);
        uploadedFiles.forEach(file => {
            console.log(`     - ${file.fileName}: ${file.fileStoreId}`);
        });
        console.log(`   • Final status: ${submitResponse.Application.workflowStatus || 'SUBMITTED'}`);
        console.log(`   • Assignees: ${submitResponse.Application.workflow.assignees.length} BPA HODs`);
        console.log('\n📊 Execution Pattern:');
        console.log('   • Step 0: Architect OTP Authentication');
        console.log('   • Steps 1-4: Sequential execution');
        console.log('   • Step 5: Parallel file uploads');
        console.log('   • Step 6: Sequential finalization');
    });
}); 