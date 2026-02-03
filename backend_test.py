#!/usr/bin/env python3
"""
MyImpact University Admin Dashboard - Backend API Testing
Tests all backend endpoints for the admin dashboard functionality.
"""

import requests
import sys
import json
from datetime import datetime

class MyImpactAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })

            return success, response.json() if success and response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_get_terms(self):
        """Test getting all terms"""
        success, response = self.run_test("Get Terms", "GET", "api/terms", 200)
        if success and response:
            print(f"   Found {len(response)} terms")
            for term in response:
                print(f"   - {term.get('name', 'Unknown')} ({term.get('term_id', 'Unknown')})")
        return success, response

    def test_get_programs(self):
        """Test getting programs for Spring 2026"""
        success, response = self.run_test(
            "Get Programs (Spring 2026)", 
            "GET", 
            "api/programs", 
            200, 
            params={"term_id": "spring-2026"}
        )
        if success and response:
            print(f"   Found {len(response)} programs for Spring 2026")
            for program in response:
                print(f"   - {program.get('name', 'Unknown')} ({program.get('active_students_count', 0)} students)")
        return success, response

    def test_get_programs_fall(self):
        """Test getting programs for Fall 2025"""
        success, response = self.run_test(
            "Get Programs (Fall 2025)", 
            "GET", 
            "api/programs", 
            200, 
            params={"term_id": "fall-2025"}
        )
        if success and response:
            print(f"   Found {len(response)} programs for Fall 2025")
        return success, response

    def test_get_kpis(self):
        """Test getting KPIs for Spring 2026"""
        success, response = self.run_test(
            "Get KPIs (Spring 2026)", 
            "GET", 
            "api/kpis", 
            200, 
            params={"term_id": "spring-2026"}
        )
        if success and response:
            print(f"   Verified Hours: {response.get('verified_hours', {}).get('value', 'N/A')}")
            print(f"   Active Students: {response.get('active_students', {}).get('value', 'N/A')}")
            print(f"   Active Programs: {response.get('active_programs', {}).get('value', 'N/A')}")
            print(f"   Retention Rate: {response.get('retention_rate', {}).get('value', 'N/A')}%")
        return success, response

    def test_get_kpis_fall(self):
        """Test getting KPIs for Fall 2025"""
        success, response = self.run_test(
            "Get KPIs (Fall 2025)", 
            "GET", 
            "api/kpis", 
            200, 
            params={"term_id": "fall-2025"}
        )
        return success, response

    def test_get_verification_requests(self):
        """Test getting verification requests"""
        success, response = self.run_test(
            "Get Verification Requests", 
            "GET", 
            "api/verification-requests", 
            200, 
            params={"term_id": "spring-2026", "status": "awaiting_confirmation"}
        )
        if success and response:
            print(f"   Found {len(response)} pending verification requests")
            for req in response:
                print(f"   - {req.get('student_name', 'Unknown')} ({req.get('request_id', 'Unknown')})")
        return success, response

    def test_confirm_verification(self, request_id):
        """Test confirming a verification request"""
        return self.run_test(
            f"Confirm Verification ({request_id})", 
            "POST", 
            "api/verification-requests/confirm", 
            200,
            data={"request_id": request_id}
        )

    def test_reject_verification(self, request_id):
        """Test rejecting a verification request"""
        return self.run_test(
            f"Reject Verification ({request_id})", 
            "POST", 
            "api/verification-requests/reject", 
            200,
            data={"request_id": request_id, "reason": "insufficient_evidence"}
        )

    def test_flag_verification(self, request_id):
        """Test flagging a verification request"""
        return self.run_test(
            f"Flag Verification ({request_id})", 
            "POST", 
            "api/verification-requests/flag", 
            200,
            data={"request_id": request_id, "reason": "Needs additional review for compliance"}
        )

    def test_get_settings(self):
        """Test getting settings"""
        return self.run_test("Get Settings", "GET", "api/settings", 200)

    def test_update_settings(self):
        """Test updating settings"""
        return self.run_test(
            "Update Settings", 
            "PUT", 
            "api/settings", 
            200,
            data={"university_name": "Test University"}
        )

    def test_export_verified_logs(self):
        """Test exporting verified logs"""
        success, _ = self.run_test(
            "Export Verified Logs", 
            "GET", 
            "api/export/verified-logs", 
            200, 
            params={"term_id": "spring-2026"}
        )
        return success

    def test_export_audit_trail(self):
        """Test exporting audit trail"""
        success, _ = self.run_test(
            "Export Audit Trail", 
            "GET", 
            "api/export/audit-trail", 
            200, 
            params={"term_id": "spring-2026"}
        )
        return success

    def test_get_audit_events(self):
        """Test getting audit events"""
        return self.run_test("Get Audit Events", "GET", "api/audit-events", 200)

def main():
    print("🚀 Starting MyImpact University Admin Dashboard Backend Tests")
    print("=" * 60)
    
    tester = MyImpactAPITester()
    
    # Test basic endpoints
    print("\n📋 BASIC ENDPOINTS")
    tester.test_health_check()
    
    # Test data retrieval
    print("\n📊 DATA RETRIEVAL")
    success, terms = tester.test_get_terms()
    success, programs_spring = tester.test_get_programs()
    success, programs_fall = tester.test_get_programs_fall()
    success, kpis_spring = tester.test_get_kpis()
    success, kpis_fall = tester.test_get_kpis_fall()
    success, vr_requests = tester.test_get_verification_requests()
    
    # Test verification workflows if we have requests
    print("\n🔍 VERIFICATION WORKFLOWS")
    if vr_requests and len(vr_requests) > 0:
        # Test with first request
        first_request = vr_requests[0]
        request_id = first_request.get('request_id')
        
        if request_id:
            print(f"\nTesting workflows with request: {request_id}")
            
            # Test confirm (this will modify data)
            tester.test_confirm_verification(request_id)
            
            # Get a different request for reject test if available
            if len(vr_requests) > 1:
                second_request = vr_requests[1]
                second_request_id = second_request.get('request_id')
                if second_request_id:
                    tester.test_reject_verification(second_request_id)
            
            # Get a third request for flag test if available
            if len(vr_requests) > 2:
                third_request = vr_requests[2]
                third_request_id = third_request.get('request_id')
                if third_request_id:
                    tester.test_flag_verification(third_request_id)
    else:
        print("⚠️  No verification requests found to test workflows")
    
    # Test settings
    print("\n⚙️  SETTINGS")
    tester.test_get_settings()
    tester.test_update_settings()
    
    # Test exports
    print("\n📤 EXPORTS")
    tester.test_export_verified_logs()
    tester.test_export_audit_trail()
    
    # Test audit events
    print("\n📋 AUDIT")
    tester.test_get_audit_events()
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS ({len(tester.failed_tests)}):")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"{i}. {test['name']}")
            if 'error' in test:
                print(f"   Error: {test['error']}")
            else:
                print(f"   Expected: {test['expected']}, Got: {test['actual']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())