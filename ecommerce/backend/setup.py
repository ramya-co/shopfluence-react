#!/usr/bin/env python3
"""
Setup script for Shopfluence Django Backend
Automates the setup process for development environment
"""

import os
import sys
import subprocess
import venv
from pathlib import Path


def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during {description}: {e}")
        print(f"Error output: {e.stderr}")
        return None


def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")


def create_virtual_environment():
    """Create and activate virtual environment"""
    venv_path = Path("venv")
    
    if venv_path.exists():
        print("📁 Virtual environment already exists")
        return str(venv_path)
    
    print("🔄 Creating virtual environment...")
    venv.create("venv", with_pip=True)
    print("✅ Virtual environment created")
    return str(venv_path)


def install_dependencies(venv_path):
    """Install Python dependencies"""
    pip_path = os.path.join(venv_path, "Scripts", "pip") if os.name == "nt" else os.path.join(venv_path, "bin", "pip")
    
    if not os.path.exists(pip_path):
        print(f"❌ pip not found at {pip_path}")
        return False
    
    print("🔄 Installing dependencies...")
    result = run_command(f'"{pip_path}" install -r requirements.txt', "Installing dependencies")
    return result is not None


def setup_database(venv_path):
    """Set up Django database"""
    python_path = os.path.join(venv_path, "Scripts", "python") if os.name == "nt" else os.path.join(venv_path, "bin", "python")
    
    if not os.path.exists(python_path):
        print(f"❌ Python not found at {python_path}")
        return False
    
    print("🔄 Setting up database...")
    
    # Run migrations
    result = run_command(f'"{python_path}" manage.py makemigrations', "Creating migrations")
    if result is None:
        return False
    
    result = run_command(f'"{python_path}" manage.py migrate', "Running migrations")
    if result is None:
        return False
    
    return True


def create_superuser(venv_path):
    """Create Django superuser"""
    python_path = os.path.join(venv_path, "Scripts", "python") if os.name == "nt" else os.path.join(venv_path, "bin", "python")
    
    print("🔄 Creating superuser...")
    print("Please enter superuser credentials when prompted:")
    
    result = run_command(f'"{python_path}" manage.py createsuperuser', "Creating superuser")
    return result is not None


def load_sample_data(venv_path):
    """Load sample data"""
    python_path = os.path.join(venv_path, "Scripts", "python") if os.name == "nt" else os.path.join(venv_path, "bin", "python")
    
    print("🔄 Loading sample data...")
    result = run_command(f'"{python_path}" manage.py setup_sample_data', "Loading sample data")
    return result is not None


def main():
    """Main setup function"""
    print("🚀 Shopfluence Django Backend Setup")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Check if we're in the backend directory
    if not os.path.exists("manage.py"):
        print("❌ Please run this script from the backend directory")
        print("cd backend && python setup.py")
        sys.exit(1)
    
    # Create virtual environment
    venv_path = create_virtual_environment()
    
    # Install dependencies
    if not install_dependencies(venv_path):
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Setup database
    if not setup_database(venv_path):
        print("❌ Failed to setup database")
        sys.exit(1)
    
    # Create superuser (optional)
    create_superuser_choice = input("\n🤔 Create a superuser? (y/n): ").lower().strip()
    if create_superuser_choice in ['y', 'yes']:
        create_superuser(venv_path)
    
    # Load sample data
    load_sample_data_choice = input("\n🤔 Load sample data? (y/n): ").lower().strip()
    if load_sample_data_choice in ['y', 'yes']:
        load_sample_data(venv_path)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Activate virtual environment:")
    if os.name == "nt":
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("2. Start the development server:")
    print("   python manage.py runserver")
    print("3. Visit http://localhost:8000/admin/ to access Django admin")
    print("4. Visit http://localhost:8000/api/ to explore the API")
    
    if load_sample_data_choice in ['y', 'yes']:
        print("\n👤 Sample user credentials:")
        print("   Email: test@example.com")
        print("   Password: testpass123")


if __name__ == "__main__":
    main()
