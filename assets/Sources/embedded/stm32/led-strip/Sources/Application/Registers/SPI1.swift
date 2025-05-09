// Generated by svd2swift.

import MMIO

/// Serial peripheral interface
@RegisterBlock
struct SPI1 {
    /// control register 1
    @RegisterBlock(offset: 0x0)
    var cr1: Register<CR1>

    /// control register 2
    @RegisterBlock(offset: 0x4)
    var cr2: Register<CR2>

    /// status register
    @RegisterBlock(offset: 0x8)
    var sr: Register<SR>

    /// data register
    @RegisterBlock(offset: 0xc)
    var dr: Register<DR>

    /// CRC polynomial register
    @RegisterBlock(offset: 0x10)
    var crcpr: Register<CRCPR>

    /// RX CRC register
    @RegisterBlock(offset: 0x14)
    var rxcrcr: Register<RXCRCR>

    /// TX CRC register
    @RegisterBlock(offset: 0x18)
    var txcrcr: Register<TXCRCR>

    /// I2S configuration register
    @RegisterBlock(offset: 0x1c)
    var i2scfgr: Register<I2SCFGR>

    /// I2S prescaler register
    @RegisterBlock(offset: 0x20)
    var i2spr: Register<I2SPR>
}

extension SPI1 {
    /// control register 1
    @Register(bitWidth: 32)
    struct CR1 {
        /// Bidirectional data mode enable
        @ReadWrite(bits: 15..<16, as: BIDIMODEValues.self)
        var bidimode: BIDIMODE

        /// Output enable in bidirectional mode
        @ReadWrite(bits: 14..<15, as: BIDIOEValues.self)
        var bidioe: BIDIOE

        /// Hardware CRC calculation enable
        @ReadWrite(bits: 13..<14, as: CRCENValues.self)
        var crcen: CRCEN

        /// CRC transfer next
        @ReadWrite(bits: 12..<13, as: CRCNEXTValues.self)
        var crcnext: CRCNEXT

        /// CRC length
        @ReadWrite(bits: 11..<12, as: CRCLValues.self)
        var crcl: CRCL

        /// Receive only
        @ReadWrite(bits: 10..<11, as: RXONLYValues.self)
        var rxonly: RXONLY

        /// Software slave management
        @ReadWrite(bits: 9..<10, as: SSMValues.self)
        var ssm: SSM

        /// Internal slave select
        @ReadWrite(bits: 8..<9, as: SSIValues.self)
        var ssi: SSI

        /// Frame format
        @ReadWrite(bits: 7..<8, as: LSBFIRSTValues.self)
        var lsbfirst: LSBFIRST

        /// SPI enable
        @ReadWrite(bits: 6..<7, as: SPEValues.self)
        var spe: SPE

        /// Baud rate control
        @ReadWrite(bits: 3..<6, as: BRValues.self)
        var br: BR

        /// Master selection
        @ReadWrite(bits: 2..<3, as: MSTRValues.self)
        var mstr: MSTR

        /// Clock polarity
        @ReadWrite(bits: 1..<2, as: CPOLValues.self)
        var cpol: CPOL

        /// Clock phase
        @ReadWrite(bits: 0..<1, as: CPHAValues.self)
        var cpha: CPHA
    }

    /// control register 2
    @Register(bitWidth: 32)
    struct CR2 {
        /// Rx buffer DMA enable
        @ReadWrite(bits: 0..<1, as: RXDMAENValues.self)
        var rxdmaen: RXDMAEN

        /// Tx buffer DMA enable
        @ReadWrite(bits: 1..<2, as: TXDMAENValues.self)
        var txdmaen: TXDMAEN

        /// SS output enable
        @ReadWrite(bits: 2..<3, as: SSOEValues.self)
        var ssoe: SSOE

        /// NSS pulse management
        @ReadWrite(bits: 3..<4, as: NSSPValues.self)
        var nssp: NSSP

        /// Frame format
        @ReadWrite(bits: 4..<5, as: FRFValues.self)
        var frf: FRF

        /// Error interrupt enable
        @ReadWrite(bits: 5..<6, as: ERRIEValues.self)
        var errie: ERRIE

        /// RX buffer not empty interrupt enable
        @ReadWrite(bits: 6..<7, as: RXNEIEValues.self)
        var rxneie: RXNEIE

        /// Tx buffer empty interrupt enable
        @ReadWrite(bits: 7..<8, as: TXEIEValues.self)
        var txeie: TXEIE

        /// Data size
        @ReadWrite(bits: 8..<12, as: DSValues.self)
        var ds: DS

        /// FIFO reception threshold
        @ReadWrite(bits: 12..<13, as: FRXTHValues.self)
        var frxth: FRXTH

        /// Last DMA transfer for reception
        @ReadWrite(bits: 13..<14, as: LDMA_RXValues.self)
        var ldma_rx: LDMA_RX

        /// Last DMA transfer for transmission
        @ReadWrite(bits: 14..<15, as: LDMA_TXValues.self)
        var ldma_tx: LDMA_TX
    }

    /// status register
    @Register(bitWidth: 32)
    struct SR {
        /// Frame format error
        @ReadOnly(bits: 8..<9)
        var fre: FRE

        /// Busy flag
        @ReadOnly(bits: 7..<8)
        var bsy: BSY

        /// Overrun flag
        @ReadOnly(bits: 6..<7)
        var ovr: OVR

        /// Mode fault
        @ReadOnly(bits: 5..<6)
        var modf: MODF

        /// CRC error flag
        @ReadWrite(bits: 4..<5)
        var crcerr: CRCERR

        /// Underrun flag
        @ReadOnly(bits: 3..<4)
        var udr: UDR

        /// Channel side
        @ReadOnly(bits: 2..<3)
        var chside: CHSIDE

        /// Transmit buffer empty
        @ReadOnly(bits: 1..<2)
        var txe: TXE

        /// Receive buffer not empty
        @ReadOnly(bits: 0..<1)
        var rxne: RXNE

        /// FIFO reception level
        @ReadOnly(bits: 9..<11)
        var frlvl: FRLVL

        /// FIFO Transmission Level
        @ReadOnly(bits: 11..<13)
        var ftlvl: FTLVL
    }

    /// data register
    @Register(bitWidth: 32)
    struct DR {
        /// Data register
        @ReadWrite(bits: 0..<16)
        var dr_field: DR_FIELD
    }

    /// CRC polynomial register
    @Register(bitWidth: 32)
    struct CRCPR {
        /// CRC polynomial register
        @ReadWrite(bits: 0..<16)
        var crcpoly: CRCPOLY
    }

    /// RX CRC register
    @Register(bitWidth: 32)
    struct RXCRCR {
        /// Rx CRC register
        @ReadOnly(bits: 0..<16)
        var rxcrc: RxCRC
    }

    /// TX CRC register
    @Register(bitWidth: 32)
    struct TXCRCR {
        /// Tx CRC register
        @ReadOnly(bits: 0..<16)
        var txcrc: TxCRC
    }

    /// I2S configuration register
    @Register(bitWidth: 32)
    struct I2SCFGR {
        /// I2S mode selection
        @ReadWrite(bits: 11..<12, as: I2SMODValues.self)
        var i2smod: I2SMOD

        /// I2S Enable
        @ReadWrite(bits: 10..<11, as: I2SEValues.self)
        var i2se: I2SE

        /// I2S configuration mode
        @ReadWrite(bits: 8..<10, as: I2SCFGValues.self)
        var i2scfg: I2SCFG

        /// PCM frame synchronization
        @ReadWrite(bits: 7..<8, as: PCMSYNCValues.self)
        var pcmsync: PCMSYNC

        /// I2S standard selection
        @ReadWrite(bits: 4..<6, as: I2SSTDValues.self)
        var i2sstd: I2SSTD

        /// Steady state clock polarity
        @ReadWrite(bits: 3..<4, as: CKPOLValues.self)
        var ckpol: CKPOL

        /// Data length to be transferred
        @ReadWrite(bits: 1..<3, as: DATLENValues.self)
        var datlen: DATLEN

        /// Channel length (number of bits per audio channel)
        @ReadWrite(bits: 0..<1, as: CHLENValues.self)
        var chlen: CHLEN

        /// Asynchronous start enable
        @ReadWrite(bits: 12..<13)
        var astrten: ASTRTEN
    }

    /// I2S prescaler register
    @Register(bitWidth: 32)
    struct I2SPR {
        /// Master clock output enable
        @ReadWrite(bits: 9..<10, as: MCKOEValues.self)
        var mckoe: MCKOE

        /// Odd factor for the prescaler
        @ReadWrite(bits: 8..<9, as: ODDValues.self)
        var odd: ODD

        /// I2S Linear prescaler
        @ReadWrite(bits: 0..<8)
        var i2sdiv: I2SDIV
    }
}

extension SPI1.CR1 {
    struct BIDIMODEValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// 2-line unidirectional data mode selected
        static let Unidirectional = Self(rawValue: 0x0)

        /// 1-line bidirectional data mode selected
        static let Bidirectional = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct BIDIOEValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Output disabled (receive-only mode)
        static let OutputDisabled = Self(rawValue: 0x0)

        /// Output enabled (transmit-only mode)
        static let OutputEnabled = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct CRCENValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// CRC calculation disabled
        static let Disabled = Self(rawValue: 0x0)

        /// CRC calculation enabled
        static let Enabled = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct CRCNEXTValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Next transmit value is from Tx buffer
        static let TxBuffer = Self(rawValue: 0x0)

        /// Next transmit value is from Tx CRC register
        static let CRC = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct CRCLValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// 8-bit CRC length
        static let EightBit = Self(rawValue: 0x0)

        /// 16-bit CRC length
        static let SixteenBit = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct RXONLYValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Full duplex (Transmit and receive)
        static let FullDuplex = Self(rawValue: 0x0)

        /// Output disabled (Receive-only mode)
        static let OutputDisabled = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct SSMValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Software slave management disabled
        static let Disabled = Self(rawValue: 0x0)

        /// Software slave management enabled
        static let Enabled = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct SSIValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// 0 is forced onto the NSS pin and the I/O value of the NSS pin is ignored
        static let SlaveSelected = Self(rawValue: 0x0)

        /// 1 is forced onto the NSS pin and the I/O value of the NSS pin is ignored
        static let SlaveNotSelected = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct LSBFIRSTValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Data is transmitted/received with the MSB first
        static let MSBFirst = Self(rawValue: 0x0)

        /// Data is transmitted/received with the LSB first
        static let LSBFirst = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct SPEValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Peripheral disabled
        static let Disabled = Self(rawValue: 0x0)

        /// Peripheral enabled
        static let Enabled = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct BRValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 3

        /// f_PCLK / 2
        static let Div2 = Self(rawValue: 0x0)

        /// f_PCLK / 4
        static let Div4 = Self(rawValue: 0x1)

        /// f_PCLK / 8
        static let Div8 = Self(rawValue: 0x2)

        /// f_PCLK / 16
        static let Div16 = Self(rawValue: 0x3)

        /// f_PCLK / 32
        static let Div32 = Self(rawValue: 0x4)

        /// f_PCLK / 64
        static let Div64 = Self(rawValue: 0x5)

        /// f_PCLK / 128
        static let Div128 = Self(rawValue: 0x6)

        /// f_PCLK / 256
        static let Div256 = Self(rawValue: 0x7)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct MSTRValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Slave configuration
        static let Slave = Self(rawValue: 0x0)

        /// Master configuration
        static let Master = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct CPOLValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// CK to 0 when idle
        static let IdleLow = Self(rawValue: 0x0)

        /// CK to 1 when idle
        static let IdleHigh = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR1 {
    struct CPHAValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// The first clock transition is the first data capture edge
        static let FirstEdge = Self(rawValue: 0x0)

        /// The second clock transition is the first data capture edge
        static let SecondEdge = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR2 {
    struct RXDMAENValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Rx buffer DMA disabled
        static let Disabled = Self(rawValue: 0x0)

        /// Rx buffer DMA enabled
        static let Enabled = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR2 {
    struct TXDMAENValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Tx buffer DMA disabled
        static let Disabled = Self(rawValue: 0x0)

        /// Tx buffer DMA enabled
        static let Enabled = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR2 {
    struct SSOEValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// SS output is disabled in master mode
        static let Disabled = Self(rawValue: 0x0)

        /// SS output is enabled in master mode
        static let Enabled = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR2 {
    struct NSSPValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// No NSS pulse
        static let NoPulse = Self(rawValue: 0x0)

        /// NSS pulse generated
        static let PulseGenerated = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR2 {
    struct FRFValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// SPI Motorola mode
        static let Motorola = Self(rawValue: 0x0)

        /// SPI TI mode
        static let TI = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR2 {
    struct ERRIEValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Error interrupt masked
        static let Masked = Self(rawValue: 0x0)

        /// Error interrupt not masked
        static let NotMasked = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR2 {
    struct RXNEIEValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// RXE interrupt masked
        static let Masked = Self(rawValue: 0x0)

        /// RXE interrupt not masked
        static let NotMasked = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR2 {
    struct TXEIEValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// TXE interrupt masked
        static let Masked = Self(rawValue: 0x0)

        /// TXE interrupt not masked
        static let NotMasked = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR2 {
    struct DSValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 4

        /// 4-bit
        static let FourBit = Self(rawValue: 0x3)

        /// 5-bit
        static let FiveBit = Self(rawValue: 0x4)

        /// 6-bit
        static let SixBit = Self(rawValue: 0x5)

        /// 7-bit
        static let SevenBit = Self(rawValue: 0x6)

        /// 8-bit
        static let EightBit = Self(rawValue: 0x7)

        /// 9-bit
        static let NineBit = Self(rawValue: 0x8)

        /// 10-bit
        static let TenBit = Self(rawValue: 0x9)

        /// 11-bit
        static let ElevenBit = Self(rawValue: 0xa)

        /// 12-bit
        static let TwelveBit = Self(rawValue: 0xb)

        /// 13-bit
        static let ThirteenBit = Self(rawValue: 0xc)

        /// 14-bit
        static let FourteenBit = Self(rawValue: 0xd)

        /// 15-bit
        static let FifteenBit = Self(rawValue: 0xe)

        /// 16-bit
        static let SixteenBit = Self(rawValue: 0xf)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR2 {
    struct FRXTHValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// RXNE event is generated if the FIFO level is greater than or equal to 1/2 (16-bit)
        static let Half = Self(rawValue: 0x0)

        /// RXNE event is generated if the FIFO level is greater than or equal to 1/4 (8-bit)
        static let Quarter = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR2 {
    struct LDMA_RXValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Number of data to transfer for receive is even
        static let Even = Self(rawValue: 0x0)

        /// Number of data to transfer for receive is odd
        static let Odd = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.CR2 {
    struct LDMA_TXValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Number of data to transfer for transmit is even
        static let Even = Self(rawValue: 0x0)

        /// Number of data to transfer for transmit is odd
        static let Odd = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.I2SCFGR {
    struct I2SMODValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// SPI mode is selected
        static let SPIMode = Self(rawValue: 0x0)

        /// I2S mode is selected
        static let I2SMode = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.I2SCFGR {
    struct I2SEValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// I2S peripheral is disabled
        static let Disabled = Self(rawValue: 0x0)

        /// I2S peripheral is enabled
        static let Enabled = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.I2SCFGR {
    struct I2SCFGValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 2

        /// Slave - transmit
        static let SlaveTx = Self(rawValue: 0x0)

        /// Slave - receive
        static let SlaveRx = Self(rawValue: 0x1)

        /// Master - transmit
        static let MasterTx = Self(rawValue: 0x2)

        /// Master - receive
        static let MasterRx = Self(rawValue: 0x3)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.I2SCFGR {
    struct PCMSYNCValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Short frame synchronisation
        static let Short = Self(rawValue: 0x0)

        /// Long frame synchronisation
        static let Long = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.I2SCFGR {
    struct I2SSTDValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 2

        /// I2S Philips standard
        static let Philips = Self(rawValue: 0x0)

        /// MSB justified standard
        static let MSB = Self(rawValue: 0x1)

        /// LSB justified standard
        static let LSB = Self(rawValue: 0x2)

        /// PCM standard
        static let PCM = Self(rawValue: 0x3)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.I2SCFGR {
    struct CKPOLValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// I2S clock inactive state is low level
        static let IdleLow = Self(rawValue: 0x0)

        /// I2S clock inactive state is high level
        static let IdleHigh = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.I2SCFGR {
    struct DATLENValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 2

        /// 16-bit data length
        static let SixteenBit = Self(rawValue: 0x0)

        /// 24-bit data length
        static let TwentyFourBit = Self(rawValue: 0x1)

        /// 32-bit data length
        static let ThirtyTwoBit = Self(rawValue: 0x2)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.I2SCFGR {
    struct CHLENValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// 16-bit wide
        static let SixteenBit = Self(rawValue: 0x0)

        /// 32-bit wide
        static let ThirtyTwoBit = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.I2SPR {
    struct MCKOEValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Master clock output is disabled
        static let Disabled = Self(rawValue: 0x0)

        /// Master clock output is enabled
        static let Enabled = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}

extension SPI1.I2SPR {
    struct ODDValues: BitFieldProjectable, RawRepresentable {
        static let bitWidth = 1

        /// Real divider value is I2SDIV * 2
        static let Even = Self(rawValue: 0x0)

        /// Real divider value is (I2SDIV * 2) + 1
        static let Odd = Self(rawValue: 0x1)

        var rawValue: UInt8

        @inlinable @inline(__always)
        init(rawValue: Self.RawValue) {
            self.rawValue = rawValue
        }
    }
}
