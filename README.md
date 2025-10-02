# Swift Stream IDE

Are you tired of dealing with broken projects over time, struggling to set up Swift with its many platform-specific nuances, or simply curious about trying Swift on **non-Apple platforms**? This extension is here to help!

**Swift Stream** is a powerful **IDE** for VS Code that enhances your ability to work with Swift projects beyond the traditional iOS/macOS ecosystem.

## 🐳 Containerized Swift Development

This extension enables you to write Swift code for **multiple streams** on **any platform**, all within a Docker container.

With a feature-packed and user-friendly environment, it ensures an exceptional development experience.

**[Install from the marketplace](https://marketplace.visualstudio.com/items/?itemName=swiftstream.swiftstream)**

## 🔧 Before Installation

Ensure you have the **[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)** extension installed in VS Code.  
Additionally, make sure **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** or **[Docker Engine](https://docs.docker.com/engine/)** is installed and running on your machine, depending on the requirements of the **Dev Containers** extension for your platform.

## 🌊 Choose Your Stream

- **Web**: Progressive web apps using WebAssembly
- **Server**: Backend apps using Vapor and Hummingbird
- **Android**: Apps (coming soon) and libraries (available today) via JNI
- **Embedded**: ESP32-C6, Raspberry Pi Pico, STM32, nrf52
- **Pure**: Libraries, macros, CLI tools, etc.

Projects for any of these streams can be easily created via the **"Start New Project"** wizard:

![StartNewProjectDemoGIF](https://swift.stream/assets/images/github/StartNewProjectDemo.gif)

## 📱 iOS, macOS, etc.

For **iOS**, **macOS**, and other Apple platforms, you still need to use **Xcode**.

## 🖥️ Where Does It Work?

Literally anywhere VS Code is available!

On Windows, Linux, and macOS, you'll have the **same experience** since your code and tools always run inside the same containerized environment — powered by Docker + DevContainer or via SSH tunnel.

## 💁‍♂️ Why Choose Containerized Development?

- Keeps your machine clean — no more toolchain and CLI-tools mess  
- Even very old projects will still compile, since they retain the original environment  
- You can deploy binaries compiled inside the container immediately  
- Easily switch between toolchains with one click  
- Work on a slow device by tunneling into a more powerful machine or server via SSH

## 🌷 Main Goals

- Stay developer-friendly  
- Let Swift newcomers start playing right away  
- Provide as many useful tools, conveniences, and features as possible

## 🧰 Functionality

First of all, you can easily create new Swift projects in an isolated, well-prepared environment.

Each stream provides a thoughtfully designed project interface, crafted with love to make maintaining your Swift project a joy.

## 💎 Features Collection

Enhance your development experience in each stream by installing powerful features with just one click!

**Server Stream** includes development tools like **Nginx** and **Ngrok**, as well as hosting integrations with **Fly.io**, **Heroku**, and more.

**Web Stream** supports a wide range of hosting platforms, including **Azure**, **Alibaba Cloud**, **Cloudflare**, **DigitalOcean**, **Firebase**, **Fly.io**, **Heroku**, **Vercel**, **Yandex Cloud**, and others.

![NgrokFeatureDemoGIF](https://swift.stream/assets/images/github/NgrokFeatureDemo.gif)

## 👨‍💻 Contributing

Please feel free to send pull requests and ask your questions in issues.

Hope this extension will be really useful for your projects! Tell you friends about it! Please don't forget to hit the ⭐️ **Star**!!!

## ✍️ Legal

**MIT License**

Apple, Swift, the Swift logo, Xcode, iOS, Mac and macOS are trademarks of Apple Inc., registered in the U.S. and other countries

Swift Stream is ©2019 Mikhail Isaev