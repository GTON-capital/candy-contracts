module.exports = {
    FTM_TEST_CONFIG: {
        //TOKEN
        WETH: "0xd0011de099e514c2094a510dd0109f91bf8791fa",
        CHI: "",
        DODO: "0xc4d0a76ba5909c8e764b67acf7360f843fbacb2d", // gton

        //Helper
        DODOSellHelper: "0xE64eaa58c6fD393B55e1B2a6a01Ba41a1B1031F8",
        DODOCalleeHelper: "0x0236a56d0B59Fb0a794745F899D25eC373Db2775",
        DODOV1PmmHelper: "0x10aA9C0C8617016E63De3022f563F2DCf88eD723",
        DODOV2RouteHelper: "0xe51F0bd5867CBD18F994E6054E241A4F8F8056C6", // 0xA3F55892ffe4785E193177277a2B34B38d1860C9
        CurveSample: "",


        //Template
        CloneFactory: "0xFfAB20Ae7D41308989a6D4a0c18ED8C4Cf1d2A80",
        FeeRateModel: "0x60420EE292E3166B727D94f389809E412AFC5a0d",
        FeeRateImpl: "0x5b1423729De3952c568eCAB4B63330f0b9C62A96",
        UserQuota: "0x2B2082dFdAD07479Cb5B70Bce1DF32130fa55dF5",
        PermissionManager: "0x75f228f38A8f0B12AA08f2aC1E020f2f1C4EF0dB",
        DVM: "0xE9e47640D84773a8E57D9Ed780Df55fFEE16b2C2",
        DPP: "0x7b6ea7C13625B5aA5f28838E4Ba84EfcF2a5c231",
        DSP: "0xFd993B1D39ca7b782B28D4d373d8e1C907cA935c",
        DPPAdmin: "0xF8bC39f2Fd7a205608B2a63dD756d92861b09ceA",
        CP: "0x2850cecf2A4f9367160F44ec801CAD71eE43bad7",
        ERC20MineV3: "0x83272Ab89FAB0d4E0e74464872996E9f70727F34",

        ERC20: "0x8b85e0F06cb5695e7417ef9f5B75dBc42013Af70",
        CustomERC20: "0x96BeB16BfE0548916c2c98fc9f0c1eBF2AC0e172",
        CustomMintableERC20: "",

        //Factory
        DVMFactory: "0x17f086A1fA244642d8795b556F6817b8CCDf655A",
        DPPFactory: "0xE0bA4376Cf561EBAD7965EC420600a869A81a742",
        DSPFactory: "0x67D197800db4682b7C5EbE9E76E364d1783E4eB1",
        UpCpFactory: "0xCbD4ad12c284392E6f6f27BD73Ffd83F7d046d9f", // UpCrowdPoolingFactory
        CrowdPoolingFactory: "0xCcD2f8Dc42a6fE1adC95f43800630A2a0292a35f",
        ERC20Factory: "",
        ERC20V2Factory: "0xBEBbf478477F67a4d06e4E09e424a29bB4c94D7d",
        ERC20V3Factory: "",
        DODOMineV3Registry: "0xdee9D40AF89Ee431f6341205C60A241e49802153",

        //Approve
        DODOApprove: "0xdCF2dd85AB681Fe4a8E71bcD8C313f3F4b4E1048",
        DODOApproveProxy: "0x4DfCEF05Ae5e20056331ED4F333Fdef6Dc4668B0",

        //Periphery
        DODOIncentive: "",


        //Adapter
        DODOV1Adapter: "0xaAedd3c52123C254C8AD4D0BB6C65e950b21Ad19",
        DODOV2Adapter: "0x69192c74de7e5DAC8D787b30d136bBC57e3392E9",
        UniAdapter: "0x07Ee38e049B4761e657eb40610bDbD39a45B8AFF",
        CurveAdapter: "",


        //Proxy
        DODOV2Proxy: "0xb2cf1cdb067b0298E1e03d62E499263FE13B435B", // DODOV2ProxyAddress
        DSPProxy: "0xD553009C1f45B1ecd362045aC2fe5811bC4d956C", // DODODspProxyAddress
        CpProxy: "0x2E993273212751246AAE5682D11597a9713235eE",  // DODOCpProxyAddress
        DPPProxy: "0xAdddbA9a0e322F689bB385C9b3B44204DDDCBc78", // DODODppProxyAddress
        RouteProxy: "0xf2F573717223810714Ca166630458c9E2FA14D6d", // DODORouteProxyAddress
        DODOMineV3Proxy: "0xE4E02985801c145d1EcCbd430C78BE6240F637bE", // other: 0x7Eb33A2d4d05f33E6A678E622Bf127E8E728f114

        //vDODO
        DODOCirculationHelper: "",
        Governance: "",
        dodoTeam: "",
        vDODOToken: "",

        //Account
        multiSigAddress: "0x18e9fcc47EF431BC160B797cBD8480E0d24B222B",
        defaultMaintainer: "0x18e9fcc47EF431BC160B797cBD8480E0d24B222B",


        //================== NFT ====================
        BuyoutModel: "",
        Fragment: "",
        NFTCollateralVault: "",
        DODONFTRouteHelper: "",

        InitializableERC721: "",
        InitializableERC1155: "",
        NFTTokenFactory: "",

        DodoNftErc721: "",
        DodoNftErc1155: "",

        DODONFTRegistry: "",
        DODONFTProxy: "",

        //================= DropsV1 =================
        // MysteryBoxV1: "0xc25286ef3BaE3f6Fe2d6d0A6e2acAd0301AF97b8", //波老师
        // MysteryBoxV1: "0xDf7E00Cd0bb91D1502a1A14575E58b5d8f20C8D4", //KAVA
        MysteryBoxV1: "", //Fear
        RandomGenerator: "",
        RandomPool: [
            "",
            ""
        ],

        //================= DropsV2 ==================
        DropsFeeModel: "",
        DropsProxy: "",

        //=================== NFTPool ==================
        DODONFTApprove: "",
        DODONFTPoolProxy: "",
        FilterAdmin: "",
        FilterERC721V1: "",
        FilterERC1155V1: "",
        NFTPoolController: ""
    }
}