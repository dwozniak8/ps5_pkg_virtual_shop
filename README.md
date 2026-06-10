# 🎮 PS5 PKG Virtual Shop

![imagem](https://i.imgur.com/uy0G3pW.png)
**PS5 PKG Virtual Shop** is a simple yet powerful web-based interface for managing and installing your local PS4/PS5 `.pkg` files on a jailbroken PlayStation 5.  
The application runs on your computer and serves a clean, controller-friendly web UI directly to your PS5’s browser, allowing one-click installation via **etaHEN’s Direct Package Installer**.

#### ⚠️ Attention - At the moment the script only accepts the ps4 PKG format.
#### ⚠️ 2.3b EtaHen version is recommended!

---

🙏 Acknowledgments

- Thanks [@Andy2000211](https://github.com/Andy2000211) for helping me test this code over and over again.
- Thanks to the developers of **Flask** and **Pillow**.  
- Huge appreciation to the **PlayStation homebrew community** for their amazing work on exploits and tools like **etaHEN**.  
- Based on **[mour0ne shop](https://x.com/m0ur0ne)**.  


---

## 📘 About the Project

This project provides a **graphical user interface** to manage a local collection of `.pkg` files for a jailbroken PS5.  
Instead of typing URLs manually or using command-line tools, this server scans your local folders, extracts metadata (like titles and icons), and presents everything in a **categorized, console-friendly storefront**.

It is built with a **Python Flask backend** and a **lightweight vanilla JavaScript frontend**.


![imagem](https://i.imgur.com/wqPDFqA.png)

---

## ✨ Features

- **Automatic Scanning:** Detects and indexes all directories defined in your configuration file.
- **Rich Metadata:** Extracts title, content ID, and icon from `.pkg` files automatically.
- **Categorized Interface:** Organizes packages into tabs based on folder structure (e.g., `games`, `apps`, `dlc`).
- **PS5 Optimized:**
  - Restricts access to PS5 consoles only.
  - Controller navigation with L2/R2 for category switching.
- **Pagination System:** Adds “Next” and “Previous” buttons for browsing large collections.
- **Real-Time Search:** Instantly filter your collection by title.
- **One-Click Installation:** Click a game card to send it directly to the PS5’s download queue via **etaHEN DPI v2**.
- **Customizable:** Configure title, folder paths, and more through a simple `configs.json` file.
- **Lightweight:** Only requires **Python, Flask, and Pillow** — no heavy dependencies.

---

## 🧰 Prerequisites

Before you begin, make sure you have:

- A **jailbroken PlayStation 5 console**
- **etaHEN** running with **Direct Package Installer (DPI v2)** active
- **Python 3.x** installed on your computer
- Both your **PC and PS5 on the same local network**

---

## ⚙️ Installation & Setup

Follow these steps to get the server running on your computer.

Now added a .exe build for Windows in releases: https://github.com/MestreTM/ps5_pkg_virtual_shop/releases

### 1️⃣ Clone the repository

```bash
git clone https://github.com/MestreTM/ps5_pkg_virtual_shop.git
cd ps5_pkg_virtual_shop
```

### 2️⃣ Install Python dependencies

Using a virtual environment is recommended.

```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install required libraries
pip install Flask Pillow waitress
```

### 3️⃣ Configure your library
![image](https://i.imgur.com/4GL2jYc.png)

You can manually configure the program by editing the `configs.json` file.

Example `configs.json`:

```json
{
    "shop_title": "My PS5 Library",
    "paths": {
        "games": "C:\\Users\\YourUser\\Documents\\PS5\\PKG\\Games",
        "apps": "/home/user/ps5/apps",
        "dlc": "D:\\PKG_Collection\\DLC",
        "updates": "/path/to/your/updates"
    }
}
```

- **shop_title:** The main title displayed in the web interface.  
- **paths:** A dictionary where each key represents a category (tab name) and each value is the folder path containing `.pkg` files.

### 4️⃣ Run the server

```bash
python app.py
```

The server will start and display which folders are being monitored.  
The first scan may take some time if you have a large collection — subsequent scans will be faster thanks to caching.

---

## 🐳 Run with Docker (ENV-based paths)

You can run the server in a container and configure PKG categories using environment variables.

### 1️⃣ Build image

```bash
docker build -t ps5-pkg-shop .
```

### 2️⃣ Run container

```bash
docker run --rm -p 5000:5000 \
  -e APP_PORT=5000 \
  -e SHOP_TITLE="My PS5 Library" \
  -e SCAN_ON_STARTUP=true \
  -e PKG_PATH_GAMES=/data/games \
  -e PKG_PATH_APPS=/data/apps \
  -v /absolute/path/to/games:/data/games:ro \
  -v /absolute/path/to/apps:/data/apps:ro \
  ps5-pkg-shop
```

### 3️⃣ Environment variables

- `APP_PORT`: HTTP port used by the app inside the container (default: `5000`).
- `SHOP_TITLE`: Title shown in the web UI.
- `SCAN_ON_STARTUP`: `true/false` to enable automatic scan on startup.
- `PKG_PATH_*`: Define categories and internal container paths.
  - Example: `PKG_PATH_GAMES=/data/games` creates category `games`.
  - Example: `PKG_PATH_UPDATES=/data/updates` creates category `updates`.

### 4️⃣ Notes

- In `zsh`, each continued line must end with `\`.
- Replace `/absolute/path/to/...` with real host paths.
- Open from PS5 browser: `http://<YOUR_PC_IP>:5000`.

---

## 🕹️ Usage

### 🔧 Find your Computer’s IP Address

- **Windows:** Open Command Prompt and type `ipconfig`
- **macOS/Linux:** Open a terminal and type `ifconfig` or `ip -a`

Look for your **IPv4 Address**, which should look like `192.168.1.100`.

### 🌐 Open on your PS5

On your PS5, open the web browser and navigate to:

```
http://<YOUR_PC_IP>:5000
```

Replace `<YOUR_PC_IP>` with the IP address you found earlier.

### 🛒 Browse and Install

- Tabs will represent each category.  
- Use **L2/R2** to switch between tabs.  
- Use **Next/Previous** to navigate through pages.  
- Click any game or app card to **install directly** to your PS5 via **etaHEN**.

---

> 💡 *PS5 PKG Virtual Shop — your personal digital library, beautifully organized.*
