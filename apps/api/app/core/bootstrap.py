import secrets
import string
from sqlalchemy.orm import Session
from app.services.admin_user_service import is_admin_initialized, create_admin_user_once

def bootstrap_admin(db: Session):
    if is_admin_initialized(db):
        return

    # Generate random credentials
    password = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(16))
    email = "admin@example.com"
    
    try:
        user, codes = create_admin_user_once(db, email=email, password=password)
        print("\n" + "="*60)
        print("🚀 AUTO-BOOTSTRAP: ADMIN ACCOUNT CREATED")
        print(f"Email:    {email}")
        print(f"Password: {password}")
        print("-" * 60)
        print("Recovery Codes (Save these!):")
        for code in codes:
            print(f"  {code}")
        print("="*60 + "\n")
    except Exception as e:
        print(f"❌ Auto-bootstrap failed: {e}")
