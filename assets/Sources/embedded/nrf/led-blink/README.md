# nrfx-blink

This example demonstrates how to integrate with the Zephyr SDK via CMake and how to build a Swift firmware application on top of the SDK and its libraries. The example was tested on an nRF52840-DK board but should also work on other Zephyr-supported boards.

<img src="https://github.com/apple/swift-embedded-examples/assets/1186214/ae3ff153-dd33-4460-8a08-4eac442bf7b0">

## Requirements

Everything you need to build the firmware is already pre-installed in this container:

- CMake, Ninja, and other build tools
- The West build system
- Python
- Zephyr SDK/toolchain

> 💡 **Note:** Flashing the board via `nrfutil` and Segger J-Link is **not supported in the container**.
> We recommend handling all board programming tasks on the **host machine**, where full USB and J-Link support is available.

Python is used **without a virtual environment** to allow build commands to be launched directly from the VS Code extension.

This approach is fine in a containerized environment, but it breaks `west packages pip --install`.

If you ever need to install or update required Python packages manually, run:
```bash
find . -type f -name 'requirements.txt' -print0 | xargs -0 -n1 -I{} pip3 install --break-system-packages -r "{}"
```

## Building

**Build it simply via `Build` button.**

Otherwise manually:
```bash
rm -rf build
cmake -B build -G Ninja -DBOARD=nrf52840dk/nrf52840 -DUSE_CCACHE=0 .
cmake --build build
```

## Running on Real Hardware

To run the firmware on an nRF52840-DK board, you will need to install Nordic's flashing tools on your **host machine** (outside the container). The container does not include J-Link or `nrfutil`.

### Step 1: Connect Your Board

Connect the **nRF52840-DK** board to your host machine using a USB cable via the **J-Link connector**.

### Step 2: Install `nRF Util` on Host

Follow the instructions on [the official website](https://docs.nordicsemi.com/bundle/nrfutil/page/guides/installing.html)


### Step 3: Flash the Firmware

Once installed, use the following commands from your host terminal to flash the firmware:
```bash
# Program
nrfutil device program --firmware .flash/zephyr.hex
# Verify
nrfutil device fw-verify --firmware .flash/zephyr.hex
# Run
nrfutil device reset
```

> Many thanks to github.com/xtremekforever for the updated instruction

> Make sure you're running this from the project directory on your host machine. You may need to copy the zephyr.hex file out of the container if it's not in a shared volume.

If successful, the green LED on the board should start blinking in a pattern.