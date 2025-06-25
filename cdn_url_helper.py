# cdn_url_helper.py

# --- Configuration (would typically come from a config file or environment variables) ---
IS_PRODUCTION = True  # Set to False for development to serve locally
CDN_DOMAIN = "https://d123abcdef.cloudfront.net"  # Example CDN domain
# Alternatively, use a custom CNAME like "https://cdn.yourcoolsite.com"
LOCAL_STATIC_PREFIX = "/static"
# --- End Configuration ---

def get_asset_url(asset_path: str) -> str:
    """
    Generates a URL for a static asset.
    In production, it points to the CDN.
    In development (or if CDN_DOMAIN is not set), it points to a local static path.

    Args:
        asset_path: The path to the asset relative to the static root
                    (e.g., "images/logo.png", "css/main.css").

    Returns:
        The full URL for the asset.
    """
    # Ensure asset_path doesn't start with a slash for proper joining
    clean_asset_path = asset_path.lstrip('/')

    if IS_PRODUCTION and CDN_DOMAIN:
        # Ensure CDN_DOMAIN doesn't have a trailing slash and asset_path doesn't have a leading one
        return f"{CDN_DOMAIN.rstrip('/')}/{clean_asset_path}"
    else:
        # Ensure LOCAL_STATIC_PREFIX doesn't have a trailing slash
        return f"{LOCAL_STATIC_PREFIX.rstrip('/')}/{clean_asset_path}"

if __name__ == "__main__":
    print("--- Simulating Production Environment ---")
    # In a real app, IS_PRODUCTION would be set based on the environment
    # For this test, we'll manually toggle it if needed or rely on the default.

    print(f"Logo URL: {get_asset_url('images/logo.png')}")
    print(f"Stylesheet URL: {get_asset_url('css/main.css')}")
    print(f"JS Bundle URL: {get_asset_url('/js/bundle.js')}") # Handles leading slash

    # --- Simulate Development Environment ---
    print("\n--- Simulating Development Environment ---")
    IS_PRODUCTION = False # Temporarily override for this part of the script
    # Or, you might have a different configuration loaded for dev
    # For example, by setting CDN_DOMAIN = None or an empty string.

    print(f"Logo URL (Dev): {get_asset_url('images/logo.png')}")
    print(f"Stylesheet URL (Dev): {get_asset_url('css/main.css')}")

    # --- Restore for any further use if this script was part of a larger system ---
    # IS_PRODUCTION = True # Or reload from actual config
    # This is more for illustration in a standalone script.
    # In a real app, config is usually loaded once at startup.

    # Example with a different CDN and ensuring no double slashes
    CDN_DOMAIN = "https_mycdn.azureedge.net/" # With trailing slash
    IS_PRODUCTION = True
    print("\n--- Production with trailing slash in CDN_DOMAIN ---")
    print(f"Asset: {get_asset_url('/path/to/asset.jpg')}")

    CDN_DOMAIN = "https_anothercdn.com" # No trailing slash
    print("\n--- Production with no trailing slash in CDN_DOMAIN ---")
    print(f"Asset: {get_asset_url('another/asset.js')}")
