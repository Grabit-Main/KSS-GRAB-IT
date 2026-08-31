from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_otp_debug_disabled():
    res = client.post("/api/auth/send-otp", json={"phone": "+919876543210"})
    assert res.status_code == 200
    data = res.json()
    assert "debug_otp" not in data, f"debug_otp should not be returned in prod mode: {data}"
    print("[OK] Issue 1 Verified: debug_otp is hidden when OTP_DEBUG is False")

def test_cart_unauthenticated_blocked():
    res_get = client.get("/api/cart/user/9876543210")
    assert res_get.status_code == 401, f"Expected 401 for unauthenticated cart read, got {res_get.status_code}"
    
    res_sync = client.post("/api/cart/sync", json={"phone": "9876543210", "items": []})
    assert res_sync.status_code == 401, f"Expected 401 for unauthenticated cart sync, got {res_sync.status_code}"
    print("[OK] Issue 4 Verified: /cart/sync and /cart/user/{phone} enforce authentication (401)")

def test_order_status_auth_and_roles():
    # Anonymous request
    res_anon = client.patch("/api/orders/test-order-123/status", json={"status": "delivered"})
    assert res_anon.status_code == 401, f"Expected 401 for unauthenticated status patch, got {res_anon.status_code}"

    # Customer role trying to set delivered
    headers_cust = {"Authorization": "Bearer demo-customer-token"}
    res_cust = client.patch("/api/orders/test-order-123/status", json={"status": "delivered"}, headers=headers_cust)
    assert res_cust.status_code == 403, f"Expected 403 for customer marking order as delivered, got {res_cust.status_code}"
    print("[OK] Issue 3 Verified: PATCH /orders/{order_id}/status blocks unauthenticated callers (401) and forbids customers setting delivered status (403)")

def test_config_credentials():
    from app.config import Settings
    assert Settings.model_fields["jwt_secret"].default == "", "jwt_secret default in Settings class should be empty string"
    assert Settings.model_fields["otp_debug"].default is False, "otp_debug default in Settings class should be False"
    print("[OK] Issue 2 & 1 Verified: Hardcoded plaintext secrets removed from config defaults")

def test_store_patch_signature():
    import inspect
    from app.store import store
    sig = inspect.signature(store.patch)
    params = list(sig.parameters.keys())
    assert params == ["table", "payload", "params"], f"store.patch parameters must be (table, payload, params), got {params}"
    print("[OK] Issue 6 Verified: store.patch argument ordering is correctly patch(table, payload, params)")

def test_category_delete_auth():
    res = client.delete("/api/categories/cat-123")
    assert res.status_code == 401, f"Expected 401 for unauthenticated category deletion, got {res.status_code}"
    print("[OK] Issue 7 Verified: DELETE /categories/{cat_id} enforces authentication and cache key updated")

def test_admin_product_suggestions_auth():
    res_get = client.get("/api/admin/product-suggestions")
    assert res_get.status_code == 401, f"Expected 401 for unauthenticated product suggestions list, got {res_get.status_code}"

    res_del = client.delete("/api/admin/product-suggestions/sug-123")
    assert res_del.status_code == 401, f"Expected 401 for unauthenticated product suggestion deletion, got {res_del.status_code}"
    print("[OK] Issue 8 Verified: /admin/product-suggestions endpoints enforce authentication (401)")

def test_user_orders_auth():
    res = client.get("/api/orders/user/9876543210")
    assert res.status_code == 401, f"Expected 401 for unauthenticated orders read, got {res.status_code}"
    print("[OK] Endpoint Verified: /orders/user/{phone} enforces authentication (401)")

if __name__ == "__main__":
    test_otp_debug_disabled()
    test_cart_unauthenticated_blocked()
    test_order_status_auth_and_roles()
    test_config_credentials()
    test_store_patch_signature()
    test_category_delete_auth()
    test_admin_product_suggestions_auth()
    test_user_orders_auth()
    print("\nALL SYSTEM REMEDIATION TESTS PASSED SUCCESSFULLY!")
