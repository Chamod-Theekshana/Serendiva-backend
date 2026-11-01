/**
 * Seed image catalogue — every photo used in the client's Stitch design export
 * (`<img src>` and CSS `background-image`, all hosted on lh3.googleusercontent.com).
 *
 * PLACEHOLDER SAMPLE CONTENT: these are the design's stock/AI photos and must be replaced by the
 * client's own photography. The seed stores one Media row per entry (key `seed/<key>.jpg`, remote
 * URL, size 0); `npm run media:import-seed` later downloads and processes them.
 *
 * Generated once from the Stitch HTML by a throw-away extraction script; edit by hand from now on.
 * Brand logos are intentionally excluded (the website ships the logo as a static asset).
 */

export interface SeedImage {
  url: string
  /** Short English alt text (max 140 characters) */
  alt: string
}

export const IMAGES = {
  // ---- Home · hero slides
  'hero-sigiriya-sunrise': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_4-RwBgOo4QQOpOovA-_0Zl-FLkwzWA8XAUtJrNwJ-z0EoFrgaRXqbvL5M6LgJbQwX8rp6qvsZV-yNrl9Sqtxnm0xqxtXEcxUC2tfdGYhCt3NAvteM76pe0uRUdqBTSS0eOMe-Pn-0XkXfGM7SzyvgU9-v86hefwJG_v3mOquEm0ve54MtAmhLQ4poyNsa1VX04vSCW5W6EPLMSixfc6ddKXalOS9abtjIkRbmNVs0QQOFTnaAN0',
    alt: 'Sigiriya Rock Fortress emerging from morning mist at golden sunrise',
  },
  'hero-ella-nine-arch-train': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCE6yDp9tcP941I2ch747QwFzNfy5xvVVLyohXEgx1LCEBl-P0tBPKIUptbPKH9xhFvm1RTRCohNFhDXxQL-OGRSokc-eP6-wZKf0mJ7QXiXi5yOoW7szV42OB6eimJL8G1oES-y29yoCmADO3OUNpsFY2UelczHsXbgQtjdx_JAo3IWktIaSFsBVAX7aOpa_Jp5UuTsrerZmyiYnROQOp64S1ZZGzmBijsqvcF6goEANK63OB6Sno',
    alt: 'Blue passenger train curving across the Nine Arch Bridge in Ella',
  },
  'hero-mirissa-palm-beach': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbE6hX51GsaanzZ-133GJhAmPXhsUcSa7h_NPErDZA5TUxz5RJDagn458BlL2irNgY4DOeBYtRf0rWp0UX5eOwh4XVNBOkZQVlNAzBRzBBbyRXmdBGgJatqn_xHLt_WsfAoZ4JwwjZbXI_p0y0WE54hHYJoieQ6DlwkCNR0fDLol19zDcXCbLp6j_NzCHieXtESS5S_GzUqObm2oWm9IsnOWV4PXTdvhTnmwhECRBOqt_2dYlsywM',
    alt: 'Golden beach lined with coconut palms at Mirissa under a pastel dusk sky',
  },
  // ---- Guide portraits
  'guide-portrait-temple': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClDGUN3kBDDEkpmvyKH-inWKok-Y0pWENVDrJCwB0bUQIcHH50KOMeC6rQC9xz1HWMAAOH1D5pfvWIggOQFPP_GqDiCliNMGV8gzL2jwegD5ptSnifk1Y0SODJrTTgJ8djB-e9kZdyBv7te-C-tsBhGpI42L7ku5Vsm163OcHaoXJl545o6EbjxYs9cNFawLzw2h-EKqwWk0dFLs_twrwEcwmjyLnQRys6u5PwXsu4twbcXBmZEzk',
    alt: 'Dinesh Jayasuriya in a cream linen shirt in an ancient temple courtyard',
  },
  'guide-candid-tea-terraces': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEFzLJcF1ZUd7OQWU6Il6ag5f9tV6o3WlRSqBlpaCjz0jAw1XOsg0XgD6xZTaj7_RFw3v2WtPm4aqKNmeFgknauupw2RGW7LPgFKpyosrQTXdpCP_YSro_ciJq3m54-SonxUwKF-EKA_mOZ8WTVedyaY0QyQDjzBjkXX3G0tp51hELA-an1NPIyHtGLtoUi5mRz67H8lIVIR_xHQuzuvwspfUNUfIAZUGaehompOp4ZRNIKdhg57s',
    alt: 'Dinesh laughing with travellers among Nuwara Eliya tea terraces, holding a vintage camera',
  },
  'guide-portrait-sigiriya': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYpZN_5e7WhQGuKYplq1v0P8qimtvSTz9RNGKrOblWD6A04vUEA7_E0oVp0Pu8IHOB0Utwdc-4UopvQzL95FnPPVNEKDyBVMlyzxn1ZLKk0FV49QZvE6HuLCLFhJ8tw3ZH14DmsZRmC-ZUmZrSh678FQOV9JHETKiG_7zDaC3XSsKDlQQD1M0XqOTyl0RAknEsfOJNInbjeXUi0Kg5byVeShSgAILag19PfgwXsE2BRjqhc4QKwjU',
    alt: 'Portrait of Dinesh Jayasuriya in an ecru linen shirt before the misty hills of Sigiriya',
  },
  'guide-video-intro-poster': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxeIOid9V9JUTjahTNpp4VTdKLjTpbB56o8qOD5rXIg4qv7PJhIcd-Idj8H_TG9O16QAoQmilICx4nTgepb2Q5KDtuPsfSNX4ROqk0pIsphA28QOi81ZdzFoS95bqPDQhz8sqTHOXuy25HadeFSVukRyEqfYXn-LEZPVXBEHWdifXzCUPxGkEiWEX0xrO62UMxc8bPF001HxEBnt1pikC5usN4v6Vg7mew2S1ZrCY5ZOGnXQCJLks',
    alt: 'Dinesh offering a palms-together Ayubowan greeting before Sigiriya Rock at sunrise',
  },
  'guide-field-binoculars-sigiriya': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5IMapj_cxfmEGXVTUyRXdSQhzJxBp4mwR-DiOkJb-psNwxFSMz8_DKq-r8Qv_F6SsAduP47-MpZxUSV4uZtNNXr2xVpIEfiXwG8O4cSYfF4ILU3cBU9qTD8CNBteaTzKQdy4k5-miYTdzv9sH5WE_UPywiWWdEZqoMlb6nuow3Q4nKye8iyiaq0zrquvaJt_SjQiuWWC84w674ITN6dVgaz75sKg2yRTMwU2ZUCDG28MnezyTwgs',
    alt: 'Dinesh with binoculars and a field notebook beside a Land Cruiser in the Sigiriya forest',
  },
  'guide-portrait-palms': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhQR1trHP85hCj6_z0hEq2T2yXMDnbMLIwIazqedo50BwX3BPnxUpznYU2PKYFqmi8wWrFCZvzaOPaz3Fmn6b7quCEVMPDKZiEPmUkW2OIZ5WzgaudQVcglWjBtj3e5iBdbsArsWohIUA2xBaO4CbyBM08751QOrUFNcJJ8_f6LzzdwZeitDLdBxvdLLtb2Fa__mN4BBuHBp_H2jOfsehxL9EbBLumUtxxE-SXCM5jN5nHCU8thUw',
    alt: 'Portrait of Dinesh Jayasuriya in a linen safari shirt against green palms',
  },
  'guide-portrait-tea-dusk': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA77wAB0sqSenkzgR1tEH3tJgFuaBzzx703Ck7neU0QbM_hTiZNznNq3jpgg2ZSYc7wL5Ntol2k4-M_Ubd4XZGJ15QUAknIXT2HYLN63pMSmheligraciI3fOca79J-R0X9IpqcBGi9mz_dwCSG_OGjiyUmQ_mG0c-DItGRxh0JLvM9PpoikkflUtES1utR38mFFb-zC8MvxRGub_XzthID5M4BCwzurcIOiUqWiPIWfPhQsNcE3Gg',
    alt: 'Portrait of Dinesh Jayasuriya against a tea plantation at golden dusk',
  },
  'guide-portrait-ella': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEflxhgJ1O9B6UQDH--yBokgVI1AGcTkboWKF0nICd5vSiNXsNg536sxJMCJ96DlyrRbtJ0g3JFUE8dbrxdXFC7En15KMc5QrHXskqIQMsjpAWjuveB5BncfngaXhkVOjsTXywwirMRsGv717ntJp3clXuE9VKxYGLKwz-VDkc_uA7o23AK6P1pCOk2zi8x5JeWlqnMURAhtMiI6J-HEmlLdJq-w-3IUSNXf6XWf1WPVNKsMzXCuE',
    alt: 'Portrait of Dinesh Jayasuriya in outdoor linen against the tea estates of Ella',
  },
  'guide-portrait-estate': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4ScxUJmcys3f2iA0Sf5vSudMsz7jvAKMo-NF5iTcGR_vTmUzY-o7R1YVcdZxDXPfwYvJJGSpRv2hVGVn7e1ao5T-g2RKeWo1ZFd0pBAAlTM5XOt-i7VHGrGCXERz336ED-4Ri7vvMkx_JtFxf7Swm5oAgV-CeFO6JrEQR2T2NoktdnkuIH5pKoiQzF1FOiDaLxoVWUgdDaD-tPZBd_qyW8vy-kGINIfUNe5hw2Zvq0ATU7TRPvb0',
    alt: 'Portrait of Dinesh Jayasuriya in colonial linen safari attire on tropical estate grounds',
  },
  'guide-portrait-cream-linen': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCzLyDR1MGO_oJJ36SIcZAvTL8E72GCyqWFRRpDng2JAEtXCWis9ti7KAY3gwR4JmY0eGAlGkvfFnJA-xonDNgGCwm6gc6o4dQbskXDz0mrl0vnrFU-aWFqEw2AhsGeDV29jtl56R-da4h43gmqsAgfMU1m7kv_rKzy8z_8avkhKHimgHkXwawi4w3mR_O1eWQ02ZoLR1y8sPcXVRNeHWmAYxHh9Qrsmw8mT3zeaWSv_u7yslDXe0',
    alt: 'Portrait of Dinesh Jayasuriya in a tailored cream linen shirt',
  },
  'guide-portrait-naturalist': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRmXck1lTAN79fNXQgF1DFZscZLwzHA0w9q0gHvt9C6D603OC-nA5u2Ix6NP4Rtk_r687YqDt-9eoOf0wz2p4h4EoHa4SS7IVPjiIrzmnKfl31T2C2cgaxCGJpOf9zGIouO3PARC58L-Pkut4-MwFqESGuiJQvu4rWIXpOKWbTlwWX4VvbVjSaEdilwBAGFOA8ttfTNEP6RJV_WjjrnpdbLHCfN6T1SgYusoealBN3ksJu0xWkRsY',
    alt: 'Dinesh Jayasuriya in a crisp natural linen shirt against lush tropical greenery',
  },
  'guide-portrait-courtyard': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoR4v7NvpWnfqHo8lwRfRrFDa8S1kWVAfGlRL4CZ1eDDirBt6UEg8Q3J1E36NlCaT8SpKvOn6mwKrmg8R84_yNdOdPkivQTAsj3y-3Km8_77RQqrdt0_NrAnfK3Dw_CZ8-FcUV6YSDRfkWBg_Lj1DyMxjySN_43EeebZjyvs0L2Qz6Gy9Y2VMvabuNUk-LDLuOcagUb5kH9Ld_f_3dXWPO8Mh5WLmh32dQUCDJZeCUYWLEQAFcmlc',
    alt: 'Portrait of Dinesh Jayasuriya in a linen safari shirt in a tropical estate courtyard',
  },
  // ---- About page
  'about-field-zoology-yala': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARQSB98d0wcvs9JICohmDplqnSBaWFLjUPmG7tauD6qdjGbVOW9zfSVZXKEH811Qnh52hx39TMcP29S7tRnvi35PWTc7McboXquw8JjfAu4wXIDGPXPiWzmBCXgARjHOrpE6yVJ63no3tAZO4cvG__rRXp5z5oja2SAS1VQOgmO8QapfvD_yKja80ONEwEAdaYZYTk34wxqrsdMlWv2X8bx_vn90H4CObvWK6KCYHfGBTD9DXckUQ',
    alt: 'Dinesh explaining leopard tracks to two travellers from a safari vehicle in Yala at sunrise',
  },
  'about-living-architecture-galle': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVP9072uQYjHBgeXM4NtbHa9F1_PJEDq3sVSaIjIJEQWbmYvHTTUIUwP4pPVDgFPG--7wqVEWRjaD-otFzh73SdBH1SAd_Am7ONvKQt-OQryjXyF2fGTsFiBtmc-zrgUkeAV5j-52aNH_PAi-uvP2_ISDbNETfS8WPLBBv1x81Ok5b7y5LIrN1xvRF9eH6qeogZlDB9OAfdv31HUDzfSEJMVZgGYbeSI9oRnXxQa5OFfKANc46znI',
    alt: 'Dinesh walking a couple along the coral-stone ramparts of Galle Fort at twilight',
  },
  'about-agrarian-heritage-tea': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGakX5O0W4PzPD_KCC4ZXBcHaTIbBN3NALr46mUJZGV5bElikyDIAdfFUhS9TOIeyE1JDRHC1Zrei03Rg8kcKDgLNTQqKRTdF-d9o2iEnJnnnQiWRftx32i-FD0jA4lDmzOCir3CTS1GJoMLx1O4ksJBb-J1F445Naf-M3EnlxlEVwuKbw76KCx8dwh7PaaX0NG3s1H9pz1Qn6Gcf5dzL6ufit8rODEoiirAoc8jUg9TwHVqeh9z8',
    alt: 'Dinesh examining two leaves and a bud with a master planter on a Nuwara Eliya estate',
  },
  'fleet-land-cruiser-prado': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_O1E01L4EnNm4Jfgux_WgNqdjKwYnXo9WrmVHTwCcxn0mYxAh2_UoSNZvNPV7MQua5dVTrAdj1FZbEPT-LdlPYfCGOnB7KHQyZ6dMxaXtXEhssQL94KI9GiBTqZ6ciij9uB-cv0kqT2XO_8vnUg5ngPqJDqXHKmyAl_P7ttctVq2d2jepJXjXaSY8TPF7RMMsIVQV_XptidTS6MHIvjF8ZvB7xuNVqC2e1P2m07x2RxsrPgAuFAo',
    alt: 'Charcoal Toyota Land Cruiser Prado at a highland lookout above tea plantations',
  },
  'fleet-hiace-vip': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDw_G1qlx7iid8EVs-vtlT_3buldViIjm2dN1CLIFPToODj89lzCJdTABbrsshA24xZLGQ6MBIEEHjE1psX600zrfgeQnc10MjDYb7TjJJwsalGCmcF0ahAnKPthprkuqGZ_Ms2v8vvZmJJcM90PnaySeBmy6IBQ_HBb1BviCPFZmJDxCdbmeUsqOqrHi-TE5xfmx3L_upZRjdtBVuUAVmrTQMwacYmKEsPbaFPqmvN-UMqamfajz4',
    alt: 'Toyota HiAce Super GL VIP van with reclining leather captain chairs',
  },
  // ---- Categories
  'cat-cultural-polonnaruwa': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBa5BB9-G4pyfcEBCRlir0zvMZznh0l329LXwAeTIbZJyXYw1G36EyMCQbhRmw2rcD1trHGrPE7CnMmmguY0PsxahC-XSRmjYLOxSYDO4_uOvxu4VtjcJ_GiQgrQu7FF9xsdwAr3CBe4ryoeXvhIkoyU6i3FAk7sfx5Kg40eN4Pyigr3ARLrirTYrdBcQPsoXqO9IRK1vItFaAJ3ARv8XAbbNP6QOOHnVYCv2ZRKgepeX6Q5n6pIPo',
    alt: 'Stone Buddha statues and ruins of Polonnaruwa in golden afternoon light',
  },
  'cat-wildlife-leopard': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmzG4Z9XDEDTMwMbdlQxgZQxKzkOe1Btaenx74cYSgpOvkCYjzcvNXVmPo1sVWw751ChwNsZpy9OIg8v6ZmJcAobEo4vYiFoCTRnVtkLWfxGCr4_8nUASsz3IQgdTIOQK_R-3UwkMIiMwaV9oIaatzoVMFH_39ShlvVfy8ZfUhTEFJgNeffTusXwoD7-5H1wcyHH5TKAiz8jZzQMFCnVlSG5cNvyh6WxxFeh9fbrtglRAnLf9x4V8',
    alt: 'Leopard draped across a granite boulder in Yala National Park',
  },
  'cat-beach-tangalle': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt166MGjV1ZyomsXavTpV9KL-qxQzyFp2SooBacug-vaeBPzrQxvsRffRso_TxvNX0m8m0jQBMJUMVNLU9t4jDQTG9rkTOGMSzqxrC2Yaa7iGfLRcVwltqqsfACg_y_RiAbxx4E0GAYk720LjVaD4kbOAApl3JDDxRjzvdTNx8AYtF4buP3W6KxPqk6u3uRuiH4foSG7eHnFQA9hwhJ88D-R5koiU_-7vRRuViW9a1MfWKPeeLXrI',
    alt: 'Turquoise waves on the golden sands of Tangalle at sunset',
  },
  'cat-hill-country-tea': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQSusrQtOnV3PQeoZvBxtMMQ03q9PNiq1loRVV4MRW0YjwnTcGtSLswn_yipnr6JjmO44pB9ogQgClqCBmpPhV0ctkzia7WXVv8ywne5A0KoCEvXGv6Mq47qdNZb356qq1VDYVvlxqcexmJb0-hFmKwqalhq5wfyWghVOi7sCiWqQSiWV6yNnHdB2NPAJVzjLvFuehEYQJScF8pjvAuL4owTdszSmJjjjrEiNpX5Nh48E6uJzFx98',
    alt: 'Mist over terraced tea fields in Nuwara Eliya with a tea plucker in a saree',
  },
  'cat-trekking-knuckles': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKe0LDmAHKxYMoGGCA1IDq6NPx6mfZuEHoCit5ij_EriAbMszQBTuyQ-bEv1X5K5egBhd52r6Q-ojVmcEFLLUvNPm6hWljtQI7lZ5sNED4QMVW3DWuAjmBTEsPkGV44JrpyZQ4j-HNvzr2tw5s1ft_coT8TD8Hr4HqLapVA-OOSLl7UeGSdblsIHDInIRAkIvSJceGd48Q0JbdCfJ0c18L2vekDiwP9kEvdwRIcK-TB3I4tdKlgRc',
    alt: 'Cloud forest summit and hiking trail in the Knuckles Range',
  },
  'cat-honeymoon-villa-pool': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxedyuMF3HEU8TeVrrSFHDa2qPsGVF3TiqOyMpZz3otpNIuiwmf_dbYNcQwwje6alWqgQ7tVuBNVkxPzmbojdwgewzViVvtVZH8NWEW021Tf_Wh5uftwSQxm7EyiQ5cGHDqoXE_iFT1uSc0NFgtUAEzzgV6b18_fpyxD8_yP04sc6atvXPq4sNZ3g_l7cUkFhiU21vmEILhkk8P4FtlAqZ807MP08qAzeNpDHMuifUinq5cC2lDtY',
    alt: 'Open-air villa pool above the Indian Ocean at sunset with glowing lanterns',
  },
  'cat-family-udawalawe': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd1iMxSZAFYQQna5nQerhQi_LeQFx560TUuOzy-WY2T3cdfxzAPOOhJ_xsqv_05mReGC8VcUbE2gNBK0QhFWBbtYQPFLYi4kuSU-R-lDoLYNXVcQeD1U1k3yLTp979cL2xwTPY9FV2HF78LIm0d7boPQZ9DwPW8M0s-v6KkKkwmHnkQD1jW64X8mITQrnj2HyfzoR2kbn8KyPg0PBPSuOTd-nlamvkEgRqhmymRBu2Q21LDhnbtkk',
    alt: 'Family watching elephant calves play in Udawalawe National Park',
  },
  'cat-ayurveda-pavilion': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqmGz9kAc47hHo2DaQbvnP3bDVtq0ttdPYSNLkqtsQtakvlPXaZFrRK7ThaJhDU0gaBq-HyXICp9ofJTlQS_tfO1yl0o7HkCSUTsuNrbLzcgPpBT9Ess_GMJ9Wcodxnk__vY-5lEudx24gxxnD_EMmlPdSlBAxdKyxP4V7xfmGFTBQ7bnYd5Ammvsgzg0cahdnUaPo3raRNrZggan58nB88eBNAfxQ6ooFc0jVVOZbywqzQI1meS8',
    alt: 'Ayurvedic wellness pavilion among lotus ponds with a warm oil brass urn',
  },
  'cat-ramayana-seetha-amman': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAqWepzvitwFPBjD-l8PhX0fXhU1ZIQ0DT0XhT40AQyNpvj55HodxCcrGchK_HKvUdHkuaukxfV-CEVqxhi-bIBFSMW0ORGOvv0Q6AJYzI8PAUm7yRAjAPX0z6QjAUFJ_5q0WuWbZPpEHwbAhfsZmp_j2on7Z7D9OEKja1NayyIDfP3EYOXKHJ4gl3PgZWCAlU_7qsOuE4q28DZQNW0gXa8sEdoOeOVcvS2D7GhrKfdJ6if23SiGw',
    alt: 'Seetha Amman temple among mountain streams in the Nuwara Eliya highlands',
  },
  // ---- Tours page
  'tours-hero-nine-arches': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7oAlP0S_t79jeNn2AnH6pvLchb14ch_uYwr6St-GJWqPHYQyDBPuz4thjZ1anCxAu9uxR7Xo50I78DARyxEikxz6pxgiR9QIzGTiJqRaxXyJoArC0EOA35TpmpnvFHGM0FbI8K2D0akjcYrhcl5QhD_1xm3dqq0Q96mbFicQykd_LUM-2Fm4w-f4C5eBwgPvnzAKCxxL3nBam9h9LmYnI8RF6Fv_Qo9IMsFHNiVZ8ay_XPc9c6nQ',
    alt: 'Blue train crossing the Nine Arches Bridge amid rolling tea hills and mist',
  },
  'tours-cta-tea-valley-mist': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzlVfENuE51fnUff3csFohmOaBUjnjuKv_uPB0h50v-eo_1-gvP6wPYVyFQVUhZQrEVcOwITQyCk97djCH9uMgZ4Z_bTiEAO3g1UFwfuvaFuwHfHc8PNOkiVE2TjJsCcFIpb7njh3oDxc8KL-np2En_pAhqTceJv7ANZTD1rdtcava9_qJgXolRWc6BKAOSMI-EsP11AIwk1WAElEnORb9zdhDAhvBcXZufLFgucim2i-Dvt__EaM',
    alt: 'Mist rolling across mountain tea valleys at sunrise',
  },
  // ---- Tour · The Cultural Odyssey
  'tour-cultural-odyssey-cover': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrLuM5XOK4-y859bsMPjfy51fgkc8z7_GfgpOy0T_rp2MTX2aDtsrwx3opz11i9JotBaAL5HCDBDC5uuJlISJ-m5oD_aJGzPtsAiaBM5Hub19dSPBGMWSPLFcvLJR5qW37ROp88MqVFc9u8NrKFw1QIQvakYERGUGh12WfNZ1IY0nJrLhxOnwm_eDLivbAiw_0ya1gS1lz7Lmtsb8CJuz_EuK5mGJGH53jVq8iV5-LkzUMhHQv-AI',
    alt: 'Sigiriya Lion Rock rising above misty jungle canopy at golden hour',
  },
  'tour-cultural-odyssey-sigiriya-dawn': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk-sd7v_92yX6HjPmcLUHpw_NBpDMJf-ulUGWL3CUoXjdwIWXPeJSkxzVgd3KbDoEJ4qEpQr-xQXe3OZS95Jxz6QvA-f4iup1rVyGo8JXVE8dkiG1kLSwq6tdMh1lnFuHTKuYgbHLgVY900kUTxP5jj3cz6nj5EmInca4M_FHjJjGvz6HyZM-BgXc5p9A0Nm421O8heztAFmZNmcc1kGaPDlrm9i8LAX_5DPZKF8JeR4Au_wq66sE',
    alt: 'Sigiriya rock fortress rising through golden morning mist',
  },
  'tour-cultural-odyssey-kandy-relic': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpw5FUdUd3-pq6VbMb9D3-xvh4IIna5uCAuj_UzQiZSWVXf4L7-6EjDuZEinW0YrvQq2rizJA5D1HM0J1I1YBLImlVg4eCug_c081Klj5YsGEylOcizKfmZfeUZ4LJAEttiJZeBhduviqiBR4LJFWn9zJxjyLlc7G5N7Re8Y4cNjx2QtNGNQ51vQlN7aWcXlm3043mOhMIqZSL08IBgzzy0OUOlOBMVIObdPQEnw-QwZgG0KckjHY',
    alt: 'Brass oil lamps at a dusk ceremony in the Temple of the Tooth, Kandy',
  },
  'tour-cultural-odyssey-gal-vihara': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVulThea1SpNjCbNdBVmQq_m9NCfZqsSx9Qqk2Qkkhp1KwJrn-QS1Y1nJNL_WKH1oHpSgaz_eyf5z7oScZ23PDZsaOIM9ui-gvoaD040syHXNNipj8Me1nV_Wqim_hgctKoUTk60osfyb-iBbfuPc_8v-BRitoWxR7h2-A1JFvkyRQAntUdDvHU-av4R0R6CPCv4qX19MVaxK9I7GVRUIgsBXWkHYnkCjD7g0-xby3ACH3yfMNyf0',
    alt: 'Colossal stone Buddha at Gal Vihara, Polonnaruwa',
  },
  'tour-cultural-odyssey-hearth-cooking': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL32TwuGuFb7K0DyWGPyGzPRZFTPynIQzpv8JjxP9HBUm4fRAe8gYsGLrnONqObgPO5XCqIvzHWCaX-5nKMiLu62ljjGZy0XreqaQVVte0_tGySyLF97D3OhQzv7ZKw0r3FpI_q4A2fycIGPL8w9CWhsG1GMGZ91gQ0Slf88ZOM5a51zM8gmlhGdSwgI_Euxi_cfbiexjsSC0oEdaQRUJ2w6HW3qB9q-t5zCiKYoYD75f7FSzUQvA',
    alt: 'Clay pots over wood embers in a rural Ceylon kitchen',
  },
  'tour-cultural-odyssey-galle-ramparts': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8-1c4Ad8kGAQXUVx6ooeI61vs99rzL4Jgy1T5Pyaq5SdwC3B1akvR71NY-9PrqQ8k10ry3wG6eFndnLftSfngMg659mmeiYZGVj2GJe3NizQwbkDvNsTWcBj_a7zO44Ms54OUcXtQU9sqqS0yGTK2yJArKsmsgA0u5XAWaiqpZggD69d4SQD43STPDWKQLzYjSdnFxjsomiQUyr9ZJnIKGOJpxIDnlFYo_sVSvHLT6sslyIyEtbM',
    alt: 'Galle Fort ramparts and white lighthouse against the ocean at sunset',
  },
  'map-cultural-odyssey-route-placeholder': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIv4SHUx-ZRnKfVniU-C0fCUxoSGQC-QHsvwV9IXBiQB_un-mEXIMSpwMkRoLxrP3RJiFvRCuUDjUaE-12mJEzTBzIiLtsnvuerswR7cx9pyk3Rm19LLDb-kszNQWEQ69gGSr48l0BF1yicFke9ArgZTMUioYa04A3sptc4CwbL0YnPx2CP1zYAW2PlvhjEu6IdtuCMM27u7x-LOXoxQeYXkR53US03gUyTtFv6OQOkKIkVMl-19c',
    alt: 'Stylised route map from Sigiriya via Kandy and Nuwara Eliya to Galle',
  },
  // ---- Tours · other
  'tour-grand-ceylon-cover': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2kYkB1QBOlVZaRUjWqLNuOxNqZ4sWoZ4aYm3JPjIneu6UX-BvoKr52yhLF-4JVnA82iApFn-MRMIOuDsFyd72DcRCzyez4JyfNH92RghdrFRDeprprQHmhpMNQiRDlTjyV2zdXdmCtu9vjmD-ChjKcgXaIinkaH4QtdC0vjiFAlFnP_ACTqK7W4MCmwobrq-2NXOXJVzSXyCnRm1MbA6oFb0tiN_VtMyKVgf3ygG1hh8pkyEbdeY',
    alt: 'Tea train crossing the Nine Arch Bridge in Ella in morning light',
  },
  'tour-wild-leopards-cover': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANqhF8DwOSLnwAlM_sosr04Gn-rt1GdzCTuZU9DIS_eo0bH8JlsKUTjH8EZhEtAtp3YqkM1rV_xqyqFkn5WV0W4_Cz3FpRxWZ21BXS_crD-wM8Tk07AT7iWCC_bZIoCVjPCybxuxu6lROeUUuh_jQHEO2Smp0GpUAeFaYOAqj7fgqNXSYn0K7IfpCMncjnzIvgZxlw-NsV8agFz2zDxPRMC7bfdysqTE46hv2rjt8jOOCAKZdk5Ls',
    alt: 'Open-top safari jeep watching a leopard on a granite boulder in Yala',
  },
  'tour-wild-leopards-wilpattu-elephants': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfLLeJay3wdUVrA1w35CcODFgdoABUw9BACpgkzXwp_yQR6y2IRjq8t3VtHoP2JPp1tIhwMgPEyyinCP1Q25at5Hpr8TR2vQlcqbfwVGQ3sj202f0Mr-4dNxN5NcEZuobBYoMfm49I7KmlhifeFRiSw0GOMkVnjHsfqlSAWLzO0Q8jB9lb3Zp1OE2wn80IfE5AY7k6-5g591wXfTUjaFfot_u-WKL37MP9vkbzPV9OxP0EDipJfSI',
    alt: 'Safari jeep watching an elephant and calf in Wilpattu at sunset',
  },
  'tour-wild-leopards-yala-outcrop': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH3p1q8DXk2rcfAWpNOIwEWirBOML9NWdP7YeyjPfuo_tRTcad3MV0-HLDime3dkcuiUJfX8sgChXLILzniiDD2-pvSD0xduijePWsPvGHhzYUwR5V0oAJmJM35odT-I85hY98FoKWcSCyvMWzyOmrcwGk1E8lOVieU6Sz3-zc8E8yP-ysoc7O8C_9ryo6trhPMHk9w9YmUci0d8lc2VApu9YKIDn4BTPfHQaU0v5zZuX5DOzeIUQ',
    alt: 'Leopard on a granite outcrop in Yala at golden hour',
  },
  'tour-tea-mist-cover': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPnyD3WCC6Eowc0Sy-vq6Xmr0XR4m1InauasTW3XEjg_Cm0DO2eosCX5qPIkxGPEiiigqkfjggzfuf2PmjRIh6R4hpNUpeDRlBZFUBkiSL32EkL5WApg90L51dIhxY8lXjXy4-XYHHBDqvE2rTngzQbCte14dmryQrEL_fPxBdLvQYOahYlvOSVx52CymK_AdAs3E9D6zDAU4vJDagqukKVI18T5l_POgijwN67ZywqDx3xfXFypc',
    alt: 'Colonial tea estate bungalow among misty emerald tea terraces near Hatton',
  },
  'tour-tea-mist-planter-veranda': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALe1Y_BPpJcYZxX7fMMEBShIoPjJDbFZMKFgb8Eu-SGJIvIvPGcuOyf_hlB48NPzglVeaYZOsGgdbnbEcUbJ_xFqbOFw9KOXWmeTngwi3eqFdiM33vp9rT5pHAS0tbUXRu4W4xJdFdtgLMxpHDucKo-78GzgrLFqclJf-ValLlHn8TcLEPlXccmRoNMi5VRMPwakqXTu7IAfaeSs9otH7PbNyFWuuMa1wq1fZ7IkuLe70y8ZwvPRA',
    alt: 'Tea planter bungalow veranda overlooking tea valleys and waterfalls',
  },
  'tour-tea-mist-victorian-bungalow': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbj1re42fnIDDiXntm4aua27V1A2dDw7amKXUlThpoPdlls4lTSM9lDJ5gil3KS1uVOobHhs3P8wxmp2YYF9RTFt3_QBEEXtPjuPW_phLLHX-V4XQF5Ko6LAScz-zzKPb88K8yGryzL_ADlYplbmjdy-HmDPfEaeOZB-MSNVJgukm5-oUcxXzP1uHjEE3TMBLVWdwJ8c3NFlJXQdS4FQAKGYwilsmt0_ABoSVhwgFVRfYUchHd058',
    alt: 'Misty tea valley with a stone planter bungalow and garden roses',
  },
  'tour-southern-beaches-cover': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU9ucexPPh2k6qVei-v0jVJvif2zC-_v2wguSr746xMOyctqQzi9TnOtSAjiZ81TXpzSWzohd_FctSsJBJb-W-PNQ0_Li5HDZdiNdeBAgLuE3FdtdaNxxJwvupfNtuXXe1zHK0q5GMEyXyYJ60F4plTCJLNiQw9UFcslJNIXd2cqk94uJ-sPipre8FGHive9h2v3VaukNQOnwr5gPYPD-vgoR6uYk71xxr7dtn10IaCh0r2_9-jOg',
    alt: 'Golden crescent beach in Tangalle with palms and stilt fishermen at twilight',
  },
  'tour-honeymoon-cover': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAktumBPuB3isEtLCeBxDZOKvQmPaNIxYTCrfvVXhg6CwvOvhDnCeexWE65_m-EmeUfwkrbjUOmAEuJUfPIodo5FmWECd_Usm8DuTEC2vqxQO7BuqgX5Wp8zfE07gpOxu9zyYI10ca1EIMDD5mnYbNawVl4e-LWFdJGUIqXlVWtCTQzdIRLQDFhmJe_HwEYS5UfWf_LSxHhPdbuvfniMlI0rJ4_pHLjgmIlS1iY5JZvpOaRiNc7Po',
    alt: 'Infinity pool of a boutique villa above jungle ravines and tea mountains',
  },
  'tour-honeymoon-oceanfront-villa': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4JnNBAc_e74rCP2sGEqGyalEYefvvyfSv28bpJd8kV4eku54pZRww953ajnxiY9iWa3ftaEeS9KJGoYFKc4pDflJMiX7sABR6mQwPCYGT-0VdeAF7Lm44pbSgRfvgmM46xDQU3KPjuxxTg1yYZieLKlGWrACws-Gop5EVSykzqAXV36HanSSJOYhkMTP-Fv8LLlMlQzj9yZwzIEQLrEOsQGMMS6qstAVD-vokBhAsCJSKjeUiIBg',
    alt: 'Oceanfront villa infinity pool beneath coconut palms at sunset',
  },
  'tour-highland-trekking-cover': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJVv__qU6gWW3hdxrRWYzFYKozSaW98b8Y5MgTYEaslO7R3Sbo9iL2cLMHQWGOaH5FU1naZ2ekvOPXBenhoqSxapEUQC3ne9ErCYD6KfCHfgQlgkG6E0Re6V7mxzVM1quBi92OoctrTW-WtpfBmjxEyWkm6VHLxVeXTOCuvOPdoxR87VbYB14uMzGHV6lJFw6dp_rx2OT87TelCSFkRcQgaDokHlxJv_D_rDUYEbDjRU49_rOHDlI',
    alt: "Morning view from the ridge of Little Adam's Peak over the Ella Gap",
  },
  'tour-ramayana-cover': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpl-U-q0PTEBNs_sRjehEJHnmgjPivUIaEKFTmmodI1ubyB0ch9c7g_8WV12Ko2CntsFi8oNS9HiMlCQXZlCEPWmZHn3zEkZb87kkVJQtTXYpUHieCPtNBXgDwS-7IIh6uGqCtgQWBfblr1EFfByKUeg74QUmtfYftxgnUDtvVpBSQRaDex5Vx-W37KaIbmQdumFzJp3gINwhtCTGADYoitdQ79rLzeOTm4huMhLNY_vSwQWj8bLc',
    alt: 'Carved pillars and sanctum of Seetha Amman Kovil near Nuwara Eliya',
  },
  'tour-family-wonder-cover': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKzksJRJEZgRJ2AevD285GeEsCIlbxVtTJQQSWmVb3TncWmFGc41Us-AJfFL6ka9sNW_cfOEl7RdiAhRFf5NsOwLBTkUGqnbIl9SPt4HXDawKDt6opwrjgV5cn_Sd9vEIEcIDQAn3GZDKNLSwPHHD2DTGkd_QsTktEAJEUzCTtCIYnj1sJ4kYW2x0Qz_bG9iL-p4RKJ5lfts07P-36W6mp4fpb8YcjjIiyxXMqoBE_cDYZONlYutk',
    alt: 'Family walking beside an elephant mother and calf in an Udawalawe sanctuary',
  },
  'tour-ayurveda-cover': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsXt0HrfqX7pa2rN58RaLjrqtHXDVQLgLR0m1u7C3k4PVopZmd4suov-KUgUFtsWVxhe9q_ci6NcQzMETrF5riyPfHa25HiX4BDHc0cL1yDfP86CI9QVlPaLpw1QPKjMSEEQKKt0gkVAGe5jfsReOn_R3DeUwaIytPAD6-NQeTe_XyvEIFkm_CRFCUW5otgv97EeMdpO7rn_GZRKyqpg75cXkIaKsOzjkwOini1PLGRtmpSQcX9hs',
    alt: 'Open-air yoga shala above a lily pond in the Sinharaja rainforest',
  },
  'tour-ayurveda-sinharaja-yoga-deck': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEy9uB4eJEuUwe1HujenY8BGzBZNWix_8dMQeUivZ7sLY2PIY5OTFBc24pJM-d4v33Yi2TGCjYh9qDoZ5eSJ3P5ncXQAE50ombVdS-3Pc6Aa3K_lGmlmcOAXxnhVz9qgMkZF1OABF2-WEBqJji3hFGGyNelcC7jc-NgRe_oiVJ3kxxqk-2zMCwqsiOVoQE7SZ-YgxhOOGUZQYIW1nRbjDzPkb6O4iSCzK6uJV2BPYKuHKXc1iYSpo',
    alt: 'Yoga deck over a river in the Sinharaja rainforest',
  },
  // ---- Destinations · cards
  'dest-ella-card': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKj1uqyrwgShRxlh953MPCMItd39tj_ZuLGR8lEq_WVTMkn6ct3H0FBKQldqqgqDSbHzaai9l0xfg4CIZtmzYOhG6kf4-T-PM4uoT11f_886fgywENHcK50aZNRU2QIG6PWngEPPpizXHwJ_zQW4ZhXm1ryqzNE2HFpuZlEGxot8zdViBI6Rz3rxRdPSByivDPxiKcEE45KIJRnhpDHmpe1Ef8fh8g4QVCQaCLQM3oMlCg537jYHc',
    alt: 'Morning mist over Ella Rock tea plantations and highland pine slopes',
  },
  'dest-sigiriya-card': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp0haxlZb4ni4quDt3S5_UX5gb8w46Ec2NGq-c2IHYs-LS27FB6g-WHsSUCQVNiut2KPpsgjowGcvyq8Y12TKAv476bHramKj9PSyH_BRWygf_mVt7l1tEetWhD21oAFetp6xQVe5CtsvLWwJlnqcyUMSnMuCHkCCsKM-9eTXvy-8e_O2IQVaEoglp9tL9LLCXCl0HLKtpQaJSLC4h7uuclARzOgciu18zJ4y8g--TilyHJG197bU',
    alt: 'Sigiriya Lion Rock above misty jungle canopy at dawn',
  },
  'dest-galle-card': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4YPMbOAFCu4BV--c1M2M5mk1azqMNTdDd-c7xBBiaVb0DdSykAiintfPbpmAUbUylhzLLt99kjtyyYmKW_DM8MBwImpswxJ4Q4EJGppQobQKWhMe-BnM4gN0yEKTGxWppcW3tjIu9puK6wvHuuoluG0QTYMhbYM3_VlO3_uCrBVyG8CzjkeP0BgSiva74tNz9nicif_uXPAPpergmlcgbwEXrg_QkvTA-HviImHzZu5URCM-DhX4',
    alt: 'Galle Fort ramparts and lighthouse above cobalt surf at sunset',
  },
  'dest-yala-card': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH2ia2OTI1v_Fz_eGU1iRgBJlQsHnp31-YgV6ZvrV6e-BJdnDbgASVEd0tZhnBWvpYs-lPiG2t44kwPhbbqD62twFwp1Dq7WRB_-cctYVq7a_Q6zhkwZHpCc4jtX3BNSSb_WKAbCg4Njwqben5OSOgL6SAVU1gye8DnMsFn0J5TU4hcku-XR8h-z1ZhL0Uctho3jYWFENkCCZz4cTi_dOedzuUOaUUiBcvpoj4r16ev6WFPkSSIKw',
    alt: 'Leopard resting on a granite outcrop in Yala at golden hour',
  },
  'dest-kandy-card': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbhRcxIkpCqtAnkSc0RI6nybBgrOdKEjEGJbYgRpT-a0EHrfwDA6erwAUgv-RXTMUXzciRz-p9jUvfui_vEwFTnb0zHC6gVwihv7T1wjaVKvwxoJeweCiRCyjnVXr6bKE0klCqvAwgGF263RscNJweVCyfQkC69lB3Nanio37wASMlPSs6jS5-fvXZYYgVTTrS9bNw3eqA5-PBr1Bx2Q44Lm2hWbLj_6H4i6-BA_ZvWbcCvPqjRXU',
    alt: 'Temple of the Tooth beside Kandy Lake with misty hills behind',
  },
  'dest-mirissa-card': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzBhTqFIKponYe9J_OfRBu4uueuN0feXDj258LH4kqoMg1YV7hIyOs1mK_yrikO7iH3m-s8RaIAXNKyDn4cS9-chri5I-s5p2T-uwKV6rpsbX1G-eWV21RVN7rXOL-7f5A_nChjqX1wv5UOaXRZsJzE5FpCJyJy3YknDFxJdZ_29_VUD3VlgOLWVjIqNHv9SMrpfkGzvW8anh5suBXt2Lv2JWhsJB-YOPHSQhf7f2eyIyk8vhMe40',
    alt: 'Palm headland above a turquoise bay at Weligama and Mirissa',
  },
  'dest-nuwara-eliya-card': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMcwXKKMFxM7fzoQl1SOte3p_J23apFXjo44SIAfaOmGiTOtSSRxaa0PZRUZxicqPpOyQ5YAyijWdkwX7bZrfWxGPOZe8u12B0KOXhhQuxz25UAVg81pd4UUKPn2GBNqsCO6bPZZ_dE2cVyT8mvuPxaD6GRCa5VJcsUAppOgZnmCQ3vWavqB2pJC5lQnF0ttJ5gVtJhVuwme6muEwwKyF0ID9jMzZRY63Ikz9caoBtbsPk2HX8RKo',
    alt: 'Red-brick colonial estate and rose gardens in Nuwara Eliya',
  },
  'dest-trincomalee-card': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGrQudSQ-zxVoE3Eur4aGJAl3iTCFsd5MhZj4M5dYRkhlt66MStJGQ44sq71HSwlxzyt_W9aQKuwLPbOqltYT5ccs3WZvEdY0ox4m8jtUMNjzLabSUajs55nu8fqLGJqCy8RUZk1wCmjMZF95gVAgAwD41tYWTcs33jCcuip-Yl_uBK1DoRFapEsauyLmNBRehY3BcBB-VjXXnTkHprDYOn3WBrgbmc_1BjkjB3webGv9ZoPjHwjM',
    alt: 'Koneswaram temple on a cliff above the sapphire sea at Trincomalee',
  },
  // ---- Destinations · home mosaic
  'dest-sigiriya-aerial-moat': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGlJxm4Fzm3KH68whkUe3X2xZOJ07vTzRN2gQFQ7lAE2p-QROvZ69yJMfWQ6IO0umDbpAW-9BQTOJgCBCfsarwK4rUs8l3YCDuMBZTj0IoKSJwbZpnxZcExWeuRCfRT6XuXJ9sz9VPdmIwXaHf6g7n1tMHt70i8qnxM9viW5vMtm0tWZ7KTu5LLAnvK2sWfhnyMKgo_nzKN0onBMc4deisLWrjHWnCcQrNh7Vv0FjkIPnyxEtSQw',
    alt: 'Aerial view of Sigiriya with its moat and water gardens at sunrise',
  },
  'dest-kandy-temple-lake-twilight': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeztnKNkgUzA3CgP01fAyZmLZ_lbJ_jJHuFpMXYzzNNgCWJuqWOurLWEME8hr6pBqt6WRoSCYDruRW4iv0k9RZ1Uhd_BYKV6c-EPY18iLA7IDKLkniZl1dXenYg21ojUFnYJLEfTkaUZ5FrMoYmzg8FnzZpIq6RtfD11kXiAZVjo0pnyjCiB_MHWFvpNwB6P8YBEjNkGFBaC5RpNzX0i2eQHm3auIBjzsg-HAdoTn7uRYALDuhxps',
    alt: 'Temple of the Tooth reflected in Kandy Lake at twilight',
  },
  'dest-ella-gap-viewpoint': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqzSczD_KZym4dy-VPOy9T29Ua0ltqqcC4XvIuTGkUA5NM6UqZDViH96_C7hZ5j6EG9Y17JAlKpdtII0nWhOqpkiKPFsR3tj1DcblUs1O4sk_Kys9kZuM1-9b5kSP-bWv003cTwenqsHt0uzahIZm9EXHetoRGr1FR8BMbgxzF_aB2oIvnhK6wKbrZ4b_BZMROGql92iq0PgaTuRrqxgwbmhYXKtr-Bk5FxGe-qF4Lg5-xIdCTwE0',
    alt: 'Ella Gap gorge and waterfalls seen through mountain mist',
  },
  'dest-nuwara-eliya-post-office': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjzRjf0pGhJDvUYqONkzRx2JBhyhsJ46nz3TAriwf1gmPC-7bXRIpARwXOsef1o3VUWDI0DZ5MF9BKSURrMtRcMIFCqZK_3PNApZv_dCvs4MKJLIe6jZF3Xpq_fsRSBMJGjw-FrO0iAkbqhYd4pfX3EwJ7MFfRYSjHl05FYF_Pd6C0vjFiI4Rij8Ombhj5BoRO7jNfVu_tdgUm4gAZSXoEE0d6OMmgRU0Yl8j1sLZI7fTIwkORFsw',
    alt: 'Red-brick colonial post office and rose gardens in misty Nuwara Eliya',
  },
  'dest-yala-leopard-trail': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAww4sGA9MKmGtauTBa4XwMXlp5fzKwaHcMmMOleurHH2zEYaO9MibCXTueo4qJ_X5MF7VECDlIKsf4UVzBnCgLrv8U47KQdqlousf3Jyet1vHMxDufd7CAh5KKR9umKeSAovFpIoJxfnfxdotoMZH3yUtI5TqhV7Xu1W-vUEcFoVGbXotGDDHuIqTt2TI-wqpOmEnFr44OqHDbY0-fu6TeEw78SYejGqkZ5KU3GoQzKmeFXqwhyT4',
    alt: 'Male leopard walking a red dirt trail in Yala National Park',
  },
  'dest-galle-lighthouse': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBplwZj055ZWLUpF930jeJzESl8tCPdXkSiVxp85yW774qsX9T2fRb5ZL364RmXYpP8anUgBEL-BUyvZonlZVdMMMXQ0OfSDRIW0RRvIFLBeRNW3RscYO7x0VRtUQdblP7Q4CYfpkql1neWgX7IaMg1ouaCwzGy7_dPp5u79p7VH9uzacFkW6IrnWhpGKPszA7o6vLlWfjiPB0pzuz6a5WUl2GdWclHqeFqoZvuTZOiyBWFYiNIXCE',
    alt: 'Galle Fort lighthouse and ramparts against crashing waves at sunset',
  },
  'dest-mirissa-blue-whale': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd6jYuvhg8nm1k5SVsNMMqF0ZKEst851nwkmMPeFBTxqd0kKhIqqoe7hyr3CrF3sL7VBiQAomKMOte--fb2n3FC5bsRm0pPv4aYxnojfRsbMAy9XnxszuOjA16heXqC58fLw-4PGqFTISh3W9dWerN-qMx8V9jZHYkPNSgaKs5ToouunfwZGi_gILl8dVsbruQ4bl8GvXXBQnEtQYWw5RCShEo4F957sjBDm7i_H_gfXE_0UD4tIA',
    alt: 'Blue whale raising its tail off the coast of Mirissa',
  },
  'dest-trincomalee-koneswaram': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8TPDJvnJpP1sdZWTgT8-5NmrZqTHUqZEtTGvy7vJz4sY-_yows-vb3b1sKTNuRRCy3V29LdLPJb65c_1d-IuxfEz-8mNwG-HMIddkUXy3EpS0ZUe2ER-Va0S_jHhbWZAx9SEK33AaT4AEgLW_wj52ll3K90G1hfccyy3AYnl7OkYIu7Oh-w__QOpdPHIqHJRBhMQ9fdVkPJDe3ORCkuMfMZ0JMcKgCa8rPw56BSUkxfig1u1z8TM',
    alt: 'Koneswaram Temple on Swami Rock above Trincomalee bay',
  },
  // ---- Destination · Ella
  'dest-ella-hero-gap': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvVjkhWOlX6BFnPrcInCsLykFyo4_rvGiWBY5r_xbNj4cYtVRSmwjXK8QfjQ6S9y6ejSVxXXxl0TzPRpFrleDMtUu9PQgwotR_3PUzAhA2DDJ-OKt-SpOOMf2bRaJxZoYMibtQHYRg7OKscsvkG3SGW6fIlgt-nEEe-X_J65YCY3hH5l0kRU95OWIU19gaReAqJ0a2fBi41batz6CEiknrzxDQxJc3tWlryhbVekv2DC_9xH9cbdc',
    alt: 'Aerial dawn panorama of the Ella Gap with ridges dropping to the southern plains',
  },
  'dest-ella-rock': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBtAn0aPKgWGodHPXLuf7pKOl3VoFV_ectTYggyhbqK8J66cpWnQJgJNxtHOEMvz8NUWIz12xcjPIzTgEBY7oxTT5jjnsFS8QqmxlBDjA5L_UJ3JSdaMRAeeNDOmPZdY0c-jYkB1RCc23VNVbu_PhNGTVOmJ5WUhQOrHRXkjUFDWyZ6OLFUsDHEkFp0XkuQ8E8jKJwaHhtVJm756OSXafFapSif-P8e13hyl_Uu9eAoiq2Qty8Ucw',
    alt: 'Ella Rock cliff emerging from jungle canopy and morning fog',
  },
  'dest-ella-nine-arches': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm0a_FP-F4rqv0eBqs2Rm-YMz3R-Qif7si0d9IwUTTIQ6mKk_qzY0BQ2_nK7-ZYz2tTB8YaYb12g8F6zU0_1XKIfTEAbaC1UNrwAEez6HZdZUdJQ1IZmrhFMa9I70gZPZ-SHdk4ZkY52aDJhUxpyI3K5iHkMAA1_kDdF_OeNyM7p_QapYxLyN3YUH0pCV8wr2sathRI5HT1izMzH40Sd4Yzz8wYLL6OM8lnSTUfsa74qPe3y9j7FQ',
    alt: 'Nine Arches Bridge at Demodara framed by banana groves and ferns',
  },
  'dest-ella-tea-plucker': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjXKNvOPVXX-5pw7EYqrxRfLLsgG6QjrjjsDxRXSSiPbDw7b1q8nMUGKerJRw-DqWYHmIGRA1oVxXgELdpULSL_RP_w8Dcqeid_0tWsHu8UqJDwnMJ6OKZpgT9d981dAbbUM8a5Ot0kVuXbdy_51Zk3a1o1elzYfDdua8oWrteNhrHEy6urLFHd2WX6lowzITnP5S7gcoCvSlBgDqU-VwihvuGvS16JMQf1DdqLuywbpPVxcSqpA8',
    alt: 'Tea plucker in a colourful saree picking two leaves and a bud in the mist',
  },
  'dest-ella-ravana-falls': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdWQIWZ7Bpf3MuGlYFmn7m_ke-oOllyl6kK5NALG55ZshI17IuIneYtiXqADm3yImbemRNV3AZTBRJs5wGjeRhTG1RKKJGPwp8f2T8_XgrlOAPW2ceG8ZMHPPha_mwVQ5daXqrM6_HT7aRjPW8afJIf2F4PB5eJrPcDUUY9EHZSvvsl_IvqcWJkYviAlW9XK4ZEbPz8wRueUTGggB3LdXfSSLnne68Ond3ieC1hHjU3UricZrGG6s',
    alt: 'Tiered cascades of Ravana Falls among granite boulders near Ella',
  },
  'dest-ella-little-adams-peak': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8i4BAxK-t_UDH6RTNQHSO6NSNbuqwZKPOq51TnQjbefiZzTNmoZ8q-wTsFXlcJw1HTywNpOhkkeglKIuzVlXjBv2wm_UrEO9bQklf8VxD7bE9jFaKXPBv8WoA-kRUiw84DPCl2sJRs5VJ7OqhLXIOufIvFtAmYwV4T_hyZdI3RaWrXFYcOoIgsvh3CdlTXxERekD3-arUaa7vP923D1Hhd-yKRuvgPGUejTeOgjth3t4_zuJ_Ct4',
    alt: "Sunrise over the Ella Gap from the summit of Little Adam's Peak",
  },
  'dest-ella-nine-arches-train': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAF34y1ZHN2QqB6WLuH0jZpke8zuLv1YkDddlkiuipKQTMMLVqdGOan9F54eMMy4LeP-8dHDo-JaphdT3SCcpLtaScFxOW7vTZ4-VTQQFdzc9TCcMkDqBXZA06T0OpSO1AiWE3ENA0atHKim7gXhu_mmdTFzwZCSD6-rUgyjkzfRCa971BJWCnCqRuxtnx80DUpKpqkBHntaW5GgANlhmjUIQNIZOR12Vho2N1HJjrr2j5CHoreiNQ',
    alt: 'Blue train rolling across the Nine Arches Bridge in Ella',
  },
  'dest-ella-tea-factory-tasting': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr8cfLu1ye3NW3rYCJI3TGIXOK6TGxR4SDOdHntS5rxOgED_bLLRIO-xameTBA2YMc11mCL1v7ZIILl3qLqdIjHZ4WzcN-KpoIdjV2T58rhiFaXi-v6ZxFgqwKupXuBZXabrWsMo0iUOBJt00z01p-hTkDtwHr2LHtQJViQfr6E5pUE4Ao9OFIUDrAiYaGyHj12olO-GPOgFCrldZ4goBwL7v7WNae5KjSfflnggTscXTyfkf4Ftw',
    alt: 'Tea tasting bowls and silver tip teas inside a colonial tea factory',
  },
  'dest-ella-river-pool': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVfr8Fte8v6ANKtfNi-Qb4Oysj0DFDlIxohZgs9UvdtvMwD-O9T6WWVx-UhG5jzR49qGjXrlwnnPMh8wHDaXrl-42tE7vdQAkWBuR-e-TEQMxXIvjKVxqyzdl4knc_ni5C81ky-6DHtm_8o9Om6qmd7YKE9Zp6AvdOBybs9NIY4-l_w0v_k5mipi-0wx6VXOv9RFYHPdfq129o_5popc91OT3H28LjS1JCf-WQueHEc9cXldDRWQ8',
    alt: 'Clear natural river pool over granite boulders in the Ella jungle',
  },
  'dest-ella-worlds-end-hikers': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhbLHw9RFdDzy7l0ZM9NS61fTzV3HJiH0yQRzGMjxrm1dS6lNvhGTbSKus84NV_Tkv6HxGR64k2nCPik_GfEAguuMYwYzRaP6N5gdRZ8FOgl99uYXYj8UBgHDU_eo0WveTjfZLNW6krAfEBhqvfuJE59P6DLhavO-jSqQelxUstgSyyJKmvWtGj_yYiErY_eDIhTHBCfzr1at-pHop6LJZddHBa0meUTDQ8RF4xEQdBNRcmXjzRbg',
    alt: "Hikers at the World's End escarpment in Horton Plains",
  },
  'dest-ella-stay-planter-bungalow': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaXtkfPaaatM_Kqpw2NrCclr8ApFM9yaztvsXqXDBKs1Fe0TsYEzUZCXHRLSafnP5elOW4mQM-80j-JptDEkgqeBOsax-rw0emLOQAZYmCDYNjaNkyesXuhBSXpmre1OLbT4O5wUhsRW7kTiJSBDBKdy-6f_loXBvi4DR3MuqKfSIufLiOpnBg2ADDtZAWdkSao7wmTsrnxJNsw7g3dRYMGmUkYajbutE6sb_xB0wkLpDGSHC0PuE',
    alt: 'Colonial planter bungalow with a white veranda and lawn above the mist',
  },
  'dest-ella-stay-cliffside-villa': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzEdLwyDJ5TRIAKkh2EbplNqEFFGj3_oa9ONKTZiDDmm6d-933959d8j2yD8TRWAv-ec36cKuY4L3ahLZpedyC98l3ptJxsx5Ns1c03WU8-Bto81mghjbNMn8crSHZ5L1SkIir2pFi28Ow7EG5QT0Akpo05PI9mGiDUBerIGv0UV7sxbohM3ZjCGODd_LCe_OmF__EiMthLsidAd2xWhq-GlToSYQuuQn51uVwWuUrPLzJ5IUU4E8',
    alt: 'Glass villa suite cantilevered over the green Ella Gap canyon',
  },
  'dest-ella-stay-demodara-villa': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABWNGsKSWR_X6RJ6hz5ArZ-jgRnEBw_0YtsQ5aYi5JQyOwlhnokLt-jua6hOWB6Q3eituEkdBACBRxT8UiKCX_lFkfm5sLA_CMZEbBSXI6FqCtoYRj7X8hzuU_eftX3vZfXRqxJBHVwlxowHBgekoDHeHvez2jIIKre6Nz7ItNt4cRmmo-EwhteYAJFiC2hHUOuHSF_o6gRhK83zHx2364nO1mGxCDsxTVYlJS_3tq17Bc1Ev2IO0',
    alt: 'Boutique villa among spice gardens in the Demodara Valley',
  },
  'dest-ella-route-tea-mist': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYuLfdz_O40VTSNtnS6D5pV0otCarHg45AjYG3UW835ubwogesIxwXpnjj0O2QT7k-JBfEOLICcpGowR-pHJvQ6m8whiG8PRLylBgq0_m5q_9PMRHkJYI_7NszHxWAJAojxlyFa7_s6Utoknkd1Hw9Zx_2WcRImLTaCR-Rx7zLhXYVQA8buq14KK3YK6m3k5y94y9CjcBn0Gkh-LE0v07tmWrU2EVSf22xJwGWQwMgDfK2jEsXBNk',
    alt: 'Blue train passing emerald tea estates between Nuwara Eliya and Ella',
  },
  'dest-ella-route-sigiriya-sunset': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1UdElkJ4fivP2MxIxPqxHO4Hq5zNFS6UZbHVrLCGdIR_un1D8rQb82_RNJ2gWKcBVmzkysApsbpktl8vTfptPVC_7rf9pa1PvG59hOfd_S5egmi0gI36rnwgtCQpFEPVeoEfgJcwCfvRc3ogCLQtq1R6dvKhEtjjfNvXumbGxH33-t21YhqrwskXdgiHZ4CidoFN2LO0lKDtV9Yif_V6sAzwoyiUUMEZtfAps6F5NHhIV1yaSV40',
    alt: 'Sigiriya above the forest canopy in a warm sunset glow',
  },
  'dest-ella-route-knuckles': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdzTHE9dUBOOSGgBhvRfGQgjjRDtt2Ii_wiMiYZu6DZcE1_99dPuI1dgOEk4SqXCrw19afxveFkxH3f-QMtHdICLt2uJcGxKlvdqXsq3mTzFAwL-QxBpCthNqVeVsz2w5WmRuE_KjdgXACKjLojl-RFAAfJSpb0P79XcY1H9R8TLCXIEo9qUu1vwN16ZkghkUc1pXJz9is-y9OhsUOCIWSozZ-a6q1abFRxfN7qdGlp0o2w6FAEac',
    alt: 'Knuckles Range peaks, ravines and cloud forest',
  },
  // ---- Home · sections
  'home-craft-high-tea-pavilion': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIr6VfmCltPPmggmf3SJozPCbXC6Aob1jYf8UF_AGbi8diRNsYtuVxudjXj4eIkqgdbs4fLjC-0TWZ4WMx1j4EufHb-p80gs7Yodmom2J-48uG83scuhSFi-zfpvhFBRLBEseg8jWxlgNb73u7ShOcBr-qBIQEmbZQQffr5Xt7H6ewdLINMh3gOtfv8jxsli50znk_jGalU9MUBehndJbJVv28iYq42cvWX0S9QSrDfElKY90t_s8',
    alt: 'Couple taking high tea on a cliffside pavilion above tea estates and waterfalls',
  },
  'corp-home-veranda-meeting': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbZX7klHahK0CwGOmfFgDqQcgDPxHsZxv3JU-QiKmj4TjfdhGl4O-orBUg09Yy7qhwU3CNOGxi-eXpt_53UZLExtKtwoWwZVWQ-zz6pqnieqECLzLMimoH-wjn-F9zYWWKNrK0Ji20dlK3KWxcRJDjVQSKVheihR1ABnvTGaN4uijmPR2nP90APHvMFxEpNlJuBChZtMta3OfMwU56xGpJo37OrwyYgHLreBDlx4ed-S_vg1p8RLE',
    alt: 'Leadership team meeting on a veranda overlooking tea mountains',
  },
  'home-cta-mountain-sunrise': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVgts667W8BSaIjx0LcE3bc5O_oDYA3rTfy3jTwT7u3EghAM8_IQm2GZiiV6dxrVMlCJU5Eyz6IVTuKPkf2U2RaedmSp5lRszBvSpO0cbctBEeWny_xunuVzEco3OJ_VP0f1uFx6j34TxAz6RYR71u7knpfmZXbgNpWzx6gWVXKy2PDdUv700Hiy_Kuz-jx8eCEUjmOZtS0Qx73XXKIljQCpMKFAf8oWzcDRKO-ImxNMYwByNxbvM',
    alt: 'Sunrise over the central mountain ridges and green valleys',
  },
  // ---- Home · Instagram
  'insta-cinnamon-quills': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB83lg7HHvBt4IaYAkk1tEEnWiqnWT68aB4J1T6Nv_M2TF-dlt_AyBbbblZAzcjmgHfjfsqxxoxgiZQo1kYEsCfzY1ucpb7yVX6g3tq7LgvrXIaoBgFPlBwh0UcC9-ImAOEQYrVyi8hTWbqHZWjXBztDmHN9eKJ6M_MJmhmedJzDXce6hTdK7Iu_Ei1PFoAvCCoMBzNZTM1mNBgSCK4n2dUQ1sUMtho-2BNlVcun516lfjil7w3NQ',
    alt: 'Freshly peeled Ceylon cinnamon quills drying in southern Sri Lanka',
  },
  'insta-minneriya-elephant': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOOXWLyXwP5aALgkAmngvbZhaOlMmIMlazwZTFMdA71lszfkOagaS26l7HN3VOkCMLtaY0u9FobhoFpCBjz-RvRrMFsx39GdkIM_7y0WK6YZL3Ji_V4quc7YjUG8qbrsWHUimn4GcjNPjUyGYKXewMJdq_c59DGmavw1vNYXO6L58zG_wk5XDUpdqIjvImwxphJeeVxumngRuomfNbNZvKxkYsfzfjxnT8kl4FwK_OYigekPdeykg',
    alt: 'Young elephant drinking at a watering hole in Minneriya at sunset',
  },
  'insta-weligama-stilt-fishermen': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_haocPjAwekfFi1s3xjOKabVyy7CQJXCifR4LziXLJLUG3krOgILeFnPQDt0LKdHFpN5YDBt-9qIFSDWtorqaGmOd6rziwitO9PskqGypHcDZDTsInaoSI92YYLGfY6e_vL2QcM6p5DUjQPKZFrUjeBYZ-gUTvLSDs0PzufAEhedvxX6wrF_mbvOqhlZ_XOKp-IR4d7TxC4_gmPYXHOr60NhHoXliYWW3czpgrxPULgjUuiH8DUo',
    alt: 'Stilt fishermen against pink sunset waves in Weligama',
  },
  'insta-train-window-tea': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_lWczTmMDjJDiqo7nroGtRqjY82SIR9HA44Nt8W6haLpD0XmBryPhziCUXyw2iAVtllfIRiOCBDqnPxcWHmPWJyoIXdTuGB-4AWle_5xLQbxVAcZjBBBny2ka9XiF55GPS1BuAbgjL5fhMlQIineSaOl9XW0sSLQ4RBQvOcRk9y8ApLxzS68JfbYStkGLkkZ7QuZqvdc4jfQ8ofvUpJmFTRZY0FEJpso5a27KY6a3P1zo488IHrE',
    alt: 'View of tea estates from an old colonial train window',
  },
  'insta-ambalangoda-mask': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiVJPqyqd8RR9PQ4NtCYhNDGY95tzyIf1K4nOzubmH5NNpWHatjE89dINgxwNcJ4ScR_rHMMX8K2Nerd8AWqVIjcbYnVcBSnZrVN4RkhjxwRMz5m8s8r1y09Dk1uzKNTKvGAngAJvG_4b_EIo79jWNnzumy1Gyi3ZI8seRaqvQ_qT-_FRQWD5Uus03DA8ISnVTBJBLMbC1RBmftF4uJZYYngwBs4x7F1UwHW8FoRKFMzbQ1B07zhg',
    alt: 'Hand-painted devil dance mask from Ambalangoda',
  },
  'insta-anuradhapura-monk': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrATeHktHsZqzRJYHf8BMDzjX7cPPpPVZ1hDW_jQVOm5AB8cdmtpo_EGr4JXZkiqXSHXwf3PHoE8yAA1tIA61-ncS46Crk94u9pwykVRKa1Rue2ZXmAKFTSBZoNRQ1C8EYmT3T4cSCNaiKmW2g68BU8t8or0x6fyAu4KBT70BACR7iGJ1xHCcXwN_QR7HIL0EIao0xbT6Buol3PYk-fV5jFBIaIjDk6TKS70fTXDuougtyM3l5sAA',
    alt: 'Buddhist monk in saffron robes among brick colonnades at Anuradhapura',
  },
  // ---- Blog
  'blog-sigiriya-pidurangala-silhouette': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZp_XyCrItT29nIr2DNcXrjqFdyklb0csPLg41k_KM5Sr8mnGPYJNTG8pA_-0HNoOEgbZgrCpwWOUH-ea0NhEoR1Vbz4afUCyO0TQFnxY3gIui1J89OdUvb3r8eMvQ37V_XSpvk3r-2A3zGBphGuGLBl_81PUiiFWD_YTja2kUAD_xse5hR5GDOlJFgqnRXdzyDDGYVq1iCOEXA53FMFeQJk_bsmIRGx4GIs-O_l0Q1OxmGMTKavs',
    alt: 'Sigiriya at dawn seen from the summit of Pidurangala Rock',
  },
  'blog-blue-train-tea': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtkG3d5wEJ2NLtvDix_4YdGUqpy4rwmQRrJD90B_3wrA02kyDDFrNWGw6138EfC8rLublKq-BcYaBy1pCCbTZP4NJ1cXQ2OvNcxkKRY4-vFoAzd9wJQWpCnOpfzqtCQbb-R2amCNNUsF3pYiJ-bKhQXzA73Pk4-JUajHTfS9vxIIxWVIcZMk5TNTiFOvi4ZfrbvtICsGKefXLsyVfR6farRzVFDc4GjDp2yzitsKYrZI5VE5QWpW0',
    alt: 'Blue train passing verdant tea plantations in morning sunlight',
  },
  'blog-crab-curry': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXgEHFEnQqHo67C7P2Rj0Im20Zlo52kKwddjjPqftF36GobU2-oEEQ9GCMJ79rwDCBHlslAKqm49cUxqA1ivJjN9gnYcQkdGKzWeoTpogY8ywfnUsO4FUegvBOczi3MML2pv3fL21QKOsKfYo0igCyQinKVqEH3zmrAxBfCS6pxh0y_aLdpRjK03wbqrblvN9SBHp12ow-lkBcSNxVV-HVF92JJqYZT_66bT5SAwiWNNaM62PFcnI',
    alt: 'Clay pot of Sri Lankan crab curry with coconut sambol on banana leaf',
  },
  'blog-sigiriya-dawn-hero': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC43vZ2rkB4e9nfyGtni8VZm0lVLY6jAIRP7wNmyPkoST81Q3z5e5La21NY0D8QWppDU8Iv7kUWUm-g3JvI7R2iQDRa8j9gqfhUUswT287TtHc7K39IPfUQCdnWlZdD7tTwt490xa3kh7kH4V4sw1A3817fvKe5hiqyHV2qOFeB35dAXRQVY8qJQcY-MROQqwQsdT6aTZRXvkZydIYGIU-Z1BQAH2ESQ6ci-ngFMUxA3olh3dInOw',
    alt: 'Dawn light on Sigiriya rock fortress above misty water gardens, without crowds',
  },
  'blog-pidurangala-view': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjiIWyFxyjipOwiXejSyQ9C68bLcTVP77n629kzkaTewQrBeof9hrUf0s0vK8Di4OBoiOBdJQfpQ3UmuHvf2k9eswdMVUBhaX-LS5-Pv2Y66uYqu2EqcxEALQrxsDTprqLCeiKiXcMnrG8yCbRrN6Y4zKVRrkpMAR4Rfcoun4S3US4SqgfYg5o39FhfkL3P_3qxxnyQL_jLcmP10ZvfFBzfBBnGrQvxoveSiETk5P6XVlAsSfO2Ds',
    alt: 'View from Pidurangala Rock toward Sigiriya over the jungle canopy at sunrise',
  },
  'blog-blue-train-nine-arches': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByLKVFbKx-vMhKzfkpRYJAQXC2C1A07YcSygLf0ZAVx_iVInvfafB20WexhSyKOcvEq5WfLO6TrGCC6jaHtv0SeQ3zbUC_DF1CvdN6O5xc3AocnxMsPmTdbp1FkwnCqlhJPf7imfxbu22ODhpd1v8I7ifSHH3JZFmQffj4dZT_9fkfAWmDYs7x4XlpibnDKlSSLfCQwXp-AGfFKVmC2kRx7Q2jCGVdKBx2ooVtGypm9jVHgNlxFds',
    alt: 'Blue hill country train crossing the Nine Arches Bridge amid tea plantations',
  },
  'blog-cinnamon-spice-kitchen': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRCA10aXW_1ddtiJJYbacMGOACrD4uT70KncC7LvBRjwrMkycEK4T__PaMIe8a9iikaVr2MZ_t_uEbwwVbjvBPH5WNH6UG_KAiV4NHEvFaEpL5n9fX30yb5WudbyRj084Ao__1KsnRDStLq8m7IvT_iV9wBC6NIANFUtiG21jMvYUuxb6WJgmUiCPIGSxelrPAUFM71I3Q_t18Tcu-wpHY8J1kXeA2eX3Rv9sY3ZntmciDA9plkaA',
    alt: 'Ceylon cinnamon quills, curry leaves and cardamom in a clay pot kitchen',
  },
  'blog-yala-leopard-palu-tree': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7qxsgzLCdQxMfPZk_Lj5V2gg5DocSC9FUKq7JeCbTRNcZ5CuBVMLXS_BXh6ov1yCG4V7YbY9RhwmNBgyyoWp3Rf_lgZHR3S-dJUT_bRlZB1z2Cu8wvL8863-_Hd645LSe224WwUOSkAo279phT2k-kkr03WM4aj_q6cEJMG7QZsnbWWn8iOFEQekWArqBDC8IuAq0ZNhwDTjIROn-ltCoVSinqIo1eb8hLC9nLCA7c1VV9wjLY4E',
    alt: 'Sri Lankan leopard resting on a palu tree branch in Yala at dawn',
  },
  'blog-bawa-lunuganga': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvc4HpmbqScL4ao_7guLA3SHRcj7Rqk9OOguH26FXewgSZmmSMGQZx3F04N4xA8o4sfubEP6K9PVCdkEuJqZp3C10d73Pa-9gC2Ai6I1JB1dPBXjX7H11FKeba5LmbKwBsz341R5I1QtMRo-9aqzBqkdQqlOnZMFRuE8jhdQNn_lZLyjy__c6oeuVFnMBIF0i8iD1AALu6xrDMSBeNgMif3uBsq93dWSwoF3YneneuZfn53LP-Zm0',
    alt: "Courtyard and lily pond at Geoffrey Bawa's Lunuganga estate in Bentota",
  },
  'blog-monsoon-mirissa-bay': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4-dGmswMaXqMylGv3kgLRlVTQw_8UK98vZzeB3bfxo26Ihtmm743UyVrxYH1wbLokhuwLJcbZL5TV8dTbWfP4Vd1wSe2POulFi42JRulct5V8dsxtW3hwuvgeZNuzI6WvfPO9iEu_uhY720yq3AgCV5d3Fw_2pV5BMTh-cxXPU_uUKVDph6a1mhS2eXXgBViQS4lNzczsh9GndOu0nRYDe1xD8ankepFnoGvAnK0THDvU48iDFWY',
    alt: 'Turquoise waves on the palm-fringed sands of Mirissa and Weligama Bay',
  },
  // ---- Gallery · plates
  'gallery-sigiriya-dawn-aerial': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkKGw-iUoSxInsRFTAEPIcfAb9h6T0fDeuFYguws6ryWKMZ4POB2zEtIv0M-o20wJZ9huubPRsovRjZncUeZZIQ46YbW3_dtBhuRLgzsHMPW4qNd5ydDaHtNDKjUpi9sxSDigv2hiL0ydlOfjyr7ndGGbCsrPRhOkSys3g4irsyI9UrMqzbstRSsqTQzM57KHhw5Mp4Z6oBK7Wkc6r8VO91NTuRLYxm0w9VIhpB1Llil3RD10U0Pc',
    alt: 'Aerial dawn view of Sigiriya rock fortress above mist-shrouded jungle',
  },
  'gallery-nine-arches-clouds': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABpQ0XlWQG_1ivYnlBMoHvEc7c7FO1SFiSOHoEvbbayi5eY_D7SEDScSpPXrORMuADbd87LPUqLHMcKw_6bYr504phLoOBEhxCBeXgrDincsV_4PttGyJwYLgy89pVJHb2EDDHFUuehIVsWAG4_S-bu-6NJcG0YjL0CEbT7Otvc615FdDrT5OcZ86hWRmQ_TzyQqFqUED6jgw191xSn70auVMjyn52XChq7u7tFmVzULemhvq6QhY',
    alt: 'Blue train crossing the Nine Arches Bridge beneath highland clouds',
  },
  'gallery-yala-leopard-boulder': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAR1IkkzzgOznp0BkmEhHRCBb5gDbxHOhTkFSMrbk4GR-4RSXwr69t2sJWzzNWwEOR1mMOuHlV42tvPqrQcFCankGQDojKaIlNtj09lTT7s0lS_OnJ_muTFBPKUd0lLEiaSCwVpb6eFzIsRLt4OwzdFHKhG6q7zCJ3EEWLh98s75LWCAVcL_o3kHKJgf7EsthB3kqbKKzylNUhv4_YR4peKarXaqjswBMQGwg-3S83Q-QgGxZf1dD0',
    alt: 'Male Sri Lankan leopard lounging on a granite boulder in Yala',
  },
  'gallery-stilt-fishermen-dusk': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHBzg5BgB2t9Zy9XdniNbypOdNQSZTvBRBoiIMg19IU5FB1qW1CHgjALmulDgaYVmNGj60o_29UfVjJpmG4bNIIWjdJ_wiy5CXhN_fbbrRpqHZ15mOVXlgoKW8ErxFo84gg1nXR-Ljbr8kJjkoKXC14BMu4viWAFUgX2aCjxWDgzqcq8EvefHVoWVZD-L5SbFA5vS3OpAvDMTX0Vhhr5FrwI7lyT_HD6OoEtt9xzW3INwCk21Ly0I',
    alt: 'Stilt fishermen silhouetted against a fiery Indian Ocean dusk',
  },
  'gallery-tea-pluckers-pedro': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRRLCQlDQFgHDZQmlObRb1Db8alwntulVwLqG2rTGRpdlFqiP8y8tih-WLgI22_JyimBWQ0ywcSt39mJRkOHGE2PEfe8IpJV44qboxyRAwsqtY2VBY0Cpq-dThP-7U8b5ooggJr_lwuW7mtu_Tk67VQwpig3tlKnaUjT3a1N0er65o85-Yd1r2NZAO4Nzpf_yO3mN89e7JAV70xn-oMpFY8x7chDytmekcjf8u7OhPjc93WwwYazY',
    alt: 'Tea pluckers harvesting two leaves and a bud in the Nuwara Eliya highlands',
  },
  'gallery-temple-tooth-lamps': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHp_KZGQtMK7Ujkclvo4uaHJCr2habxbeJsr9RQZFOooMD1wGfqnaTobKJDAafU_l3mx8ozta06qgSeO-u1cclZG9jeWHEPQI58_N675p5UWJfiJ4lWLjWYNgbakLlQRFCIe5e516WhW5Pf4KO-HXdcBej11MjHeqUlATxpomJapvBbRI18_MaJY5Trd8UCbzcqzvLfXqR_8UxvgFAukE7gB9-aG1CdRRp4DRxB-Xe7eEhXBsqeS0',
    alt: 'Coconut oil lamps glowing in the Temple of the Sacred Tooth Relic, Kandy',
  },
  'gallery-matale-spice-grove-feast': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjlbVnkeY0-TrNzdZVai0GnmIw2GlkefL5GxuinIiGXk3P7dKiig7p_FY4pZZV40_Zq5j-KtR7nkQIfUcKv1XU-JCLlY-ViqHXF50p043aj_oXpcVN8NTZpcxv21WEOJLtBFmeF-1cQVwu1kmtIlC_IABrraj-0_36xmO0jZwYvZUP12pvn-sMWLz3JHg3CaENzZGG8E45c-RjP4u3v8VCfOYAB-E5CX2vqmF9QI5qCtoE6nvXPbk',
    alt: 'Banana-leaf village feast on a teak table in a Matale spice grove',
  },
  'gallery-blue-whale-fluke': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY4c_j_2yw_xaEVueVh4levl80tU3Tgepm1OlcSjc4AVrcubd8d2yz5FZFoUuhGQFl3dJTHAqEWTVjQK3TNBvtvdB64DBViinq9c8VluShbxMzgLNA_1Z1d_nFtN7lqE0TID56JMAJflceysikQAyr3xyvd64G7IKG0OY8kxTSOdyuQ90oFwD-hgmeEBDZOd9LGuuBXKo5R6c3EAhX1UnMVY4sst5UDZ0AeKLB8UDVHXsE6DpZbp0',
    alt: 'Blue whale fluke breaking the surface off Mirissa',
  },
  'gallery-galle-ramparts-indigo': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdFNx0nOH0W3hOppOfqCAYTo-iQWEyMDdOT1IzttaJvSNrzF6Yz2ZWqsfOwvRHqUEqkgBO3n7HoRMpquZjVYTLSdkl4jo22OjLguvP47sjkxK6qX7TPlFMm1BZdRqIncEisd4IemZhWtKv558j1j2aLZZ09sMCdTWJZjJKZG7RGljEeTrAN69IpyeuA6FZwIWKSmaJ2J6kY9FEVWCL0kDj7q2BRZoKecgh_3WBROG8BCjt3Plv4Ns',
    alt: 'Lantern-lit colonnades and cobbled street in Galle Fort at twilight',
  },
  'gallery-thambili-polonnaruwa': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0tIvfZ_h1ObJkkBxqgtD5bwXD3Tu5_kDDaLgbwvUWQlN_LrU68pBr1CP7eRVQhyQe5WurS5gjenDwORvU02HazM6aWGKEDbe9N6EYs1UXvY8SOFpi-BqDEC4kT07QKk2FsRpYtRMc46326K_zu6QQulGihCqlrqkQOVboneiU4NLKohrCxCh_LzqqSe9aHi-k3jE4lJ5_gXLp6ZF4b5JABs1SPywPAMT6m0c6Gis4Z43nA9xbgaA',
    alt: 'Travelling family sharing king coconuts with Dinesh in Polonnaruwa',
  },
  'gallery-worlds-end-mist': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrmePzi1CyapL5RyjRDcih8PH3GkH8Tr6v6tY32JZyCk9yClW3JesBVI1ScDuEm8LbOtufijh7yvmny-4yEDSTP1RkirnHUTbBIyT8TNzfn60Ro65X6yemalVZrOXiHKbTOY3Kdzs3ft7B7KLOdfY7LaCnGtOnb_KbwRGrTr1eDjLnOImN490al2XRrshYtyZhgweMzmwZBzK2cMXAH1l_i4qMJQHoEq-j8Z3NRe7IhiWjWeV7qew',
    alt: "Mist swirling over the World's End escarpment at Horton Plains",
  },
  'gallery-kandalama-water-lilies': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB04Btwbu7mmNRjkyDN5trGo9vZsDWkqP6wzVH202f7C8fet_rxOE5Vy1FHYwaI4W_uOBCDL2vqo2Q3oFELW-yC2DSMaSNeWXXseTqjT3creQQosQ_hJLl2lxgPFWTfpiCzwS3s_G2hNK_o3tEJ1aKexqmEMQLH71pRxckyojBT11EWKpOk7MSreVeWFWXIsYLipJYbGD4dWNO9T2JLrOM5hI0DL1Nk4G6fI7onG9XzBo4iujfI4V0',
    alt: 'Sunset over Kandalama reservoir with water lilies and Sigiriya on the horizon',
  },
  // ---- Gallery · videos
  'gallery-video-sigiriya-dawn': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsFM205D1VkxgoCSmv-FFKzptdJAVju7Vxx6dbvMBJajiSZh01VesymgavDKksGxikCr-kcjUGgG2OY79IiYgdZl1oiJffNbXQa69xAQWMuCs7RpF39LBR-nkWlrjVE5VL3E1bhGp2xNsFKrqG0N6VLNVV9YtjByrPgeD-kLbLY2btlOxkzf40YBPJAeFqD4jmRqitYh16MdMNcMrW9PrsgRhrtJds2i5ZEYTrytKRkqB-UlaJuc4',
    alt: 'Hiker reaching the lion paws staircase of Sigiriya at sunrise',
  },
  'gallery-video-highland-railway': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_gWLfFBAkzd7HVMSW_yujMp3yqx6rcdc3zaVSriZhGSip592zFTYG4iy-E9rPDPrp2EAmqEaDjkuLO4Nbs1pDhykvGaDBQea-xRlWhdkHyEXCooQKbz1G7XQ995YoUNTjz9UdYsA4pY-kuoaD7coYv4Y3q_6Og3RjcxPqyeJaDdgZuWJgjHr66bkWgHU7DMt8k--e5s7A2JpWj6gADdeB50dDSIAnm8XG0E4z8Sp1zizf_vAm0FA',
    alt: 'Train winding through misty eucalyptus forest in the hill country',
  },
  'gallery-video-yala-tracking': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNw-lpu54RfsNA6UwwVb4RReH6giSTicPCHnW8qzDnwv6viPJq53ccPj9Lw-5BaAQ9-UOnTea3eyLfMZuAVwr3qWKp2RAP_HgJDtqRYJC2Wm6xzEuhWlp74o8ZNBeatIhFXr1MvIYeraihW-CnRBJlppgpDoUJCUkhrPmGIysbtyjuHvboWFEGXyKfLL1aGNTiX4fT88kUH434oIxI-D15HgKa-WmjGpQyEL9qJ_4HeBqX5vrsSO0',
    alt: 'Safari vehicle crossing a dry riverbed in Yala as a naturalist scans for tracks',
  },
  // ---- Gallery · Instagram strip
  'gallery-spiced-milk-tea': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABGDQabsVAXxYbhGvjKp19A5CEwfRySNejRSTfa1uMck2jCng0NxLkazzyLZoEMVmjyFS5zpKe7a0rhU1lFQRmaBLrWXJIJKaNre4M5ULvt-0ZA6K4OGqrG2Y_yYqnCHOMUsqaGysYtD6SrP5cYPqjDvjICFXOf6tHQfkA9AaMMYdzY01KUoqZxy3SWtoL7BA2KXoEj2FaY7zizr1IhWn_dDaP1JDoRUTWrg_pYpPggZdmBhBKVag',
    alt: 'Clay cups of spiced Ceylon milk tea on a brass tray with cinnamon quills',
  },
  'gallery-bawa-style-villa': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoMk4Eo5dnVx9TkN0ZIP4-feQv3NpDwZEk05hXOuWRlMvyS2eUKkzH14b1CzBt8yyU7y4Y2xt6aOV88vNnNC4KJcyphH5aIpORuc3RMLxoTXxrOKO22MmncCZtk2igmDZ2RU9_PWD_34499rFKd8qo4NfspwDeoeRm9UpFp9B3Jzn7E-xpWeGF5wwYsdVYWSjXi24NzR9cHSG6HpT-PqXZwV3Kq5fG7x4QUYb-tQWQHFZxq3vrJ6k',
    alt: 'Tropical modernist villa with an infinity pool nestled into jungle foliage',
  },
  'gallery-udawalawe-tusker': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFC02FMamftGYy5BbuNxSpJeY1ZKE6Crw02hI4cU8gnlInxhFHkQQI4JXiHCjGwiQds3LkD5NZmv0ULBgKELyNC9fzpiPoRx_GUoZ8aKwhubB895Zv58d6Pg9p1_F22VOMHozN832D8uILzz_k1bdWCeG4aFSuedUz9zTHbKtdJXInJD2i8PC2mHIk_uJ760dZb64eHwH38j15BraxDI5iiJKIBz9_O0aXax4MIznTSkiseWClnVc',
    alt: 'Tusker walking through golden grass in Udawalawe National Park',
  },
  'gallery-ambalangoda-masks': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8vXIFp26BnnRdRiQBOXeXLTSyi0tS0kDfd88CHP_tWEnF6VAGEA8L9YI608kAkeN0GS-Tb7OB8FPa3p8NT4G3c1TaCu7nVFsVpvSYtCIXQ3sc2ONOsbQ_nYGtqgdijdiJovVN206vjh4nxxDOuxvoTNJhxWtUY1FX6U2CRXzW8egt5BGZb7SBTuZyCBaLWJUDDplJxLw8ktny-iLOKmLJa-w57KHuQ6RV1cOKD32PfbwcBAMCmb4',
    alt: 'Hand-painted wooden masks in an Ambalangoda artisan workshop',
  },
  'gallery-tangalle-cove': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc75DyMjy61rsm0ENOvlMt9DOFlhGs32klgi_CIlnF6y2BFc1cVWDbqJ4OWl3XTWWMkXHzTHh-qczg8v3UxpfKFQCgIxFoQnv9YuDJJtMAyAx9qH51yJ8n2RbeoxpC91EJ_vHOVzzvi80iKVeqloTi9eLKnm46REcCf2RbMUtBdg2r6Rzi9GB6ue-MJ2eqaZgLTR2N0bPQIeJmofTKTgXpAGnzSe3qaqcn5jP3i5Xz-wP9hQCfn28',
    alt: 'Secluded white-sand cove in Tangalle with leaning coconut palms',
  },
  'gallery-chauffeur-key-fob': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA-khfoJ3ZZa8qnKoF36u1tvRehdm1gby_jVXTI52BXMvn5Sn5IVrc6xgrkZh4k6Mp7namqhn0pGeYS4wXaI_-xxtgPlGPbwfRbMaDh3fHF2U2iDopjCaagh34Veusi36hxwuAd0qBDCd1vlny0vG0zc-8KqEedi_X77RbQreQHncFsB76qHyZhR8F4l-dsX5E6gOWyIeHwwg7b93vcu54vvg3XaZCZ2t6v3hx061D3GXGtlMYaQE',
    alt: 'Chauffeur holding a brass key fob in a classic car outside a tea bungalow',
  },
  // ---- Reviews
  'review-montgomery-portrait': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsL-dhUBJNJ483Q6Fk7d5PehMN8Jr9m1qmJlY9v5XTRKaGKwLFG6s4zt_6cXEaoz1i0VQRUwn6MEFYBOKCM7jLZqoTldytxxLyH0-enQfHRld6uN5mL8TzbeMai2Mx_QMGDURCD4J4SyrtHBEQCF03rLJeNR7YrPmm0aHkSySdksqSYepXCuua14U-ZKMP2ZtNQi2tOnq6W5xXkGVLsM3p1A1hL1xQmaD9fleR_Sec-2AeVdqaA-Y',
    alt: 'Julian and Claire Montgomery on a misty tea estate bungalow terrace',
  },
  'review-montgomery-pidurangala': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2H1oBXt-MSVs7bC-9IA32LhSE3AZDNPJd-sqSLY2e2af09vNf1CaDdHbfcCTlWjfwN47obv1C2CbjDf6eyacnX3NPx2swVxh5WtEKaDJQSyzN7OEFeVRBkMNpEx0CdDMBfcb5Mu9f-vWpHFKZIhyyciS92z0Cg2REtMNgvxaHy8tQys0JkjU797mmXNTDE6K8HzjXlRp_RIAiOikWgMPyTAMFIua9McqNgqBSfTeh0rhmZDuD0O0',
    alt: 'Sunrise glow over Sigiriya seen from the summit of Pidurangala',
  },
  'review-montgomery-veranda-lunch': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXltnuhb3AIS7-rA3qzU3b7mHgoImUm0GmMalOeTIrkpYnKyRF4d31Qg3W_s0W7CgnkV5Xo9vzOLitvMsvB2AirGOBobcz30rx9WiYAdaTfww7aT_MolebTnycWBtlgCtrjNLh4u-yDoEJPEZKpowFVjqP8wpzSHzcs3T1GSzj6eptXnoLVvMEW96C0gijVHHYai8CA5dkQcF8H5FpjjwRwUqcx4eJuncCW1NGt66mitMyEm2Jeqs',
    alt: 'Table set with porcelain on a colonial veranda above tea terraces',
  },
  'review-montgomery-stilt-fisherman': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBV5kL_7rU1fk9QAjHDhIOL-VYEk6usfSek_HEKoIj6WyvVfOPDt2hGur83W9kJs8KftEr4LmBl2crb6fGrqQzXrky1NwS0fgG-lIyhSKjCIvETPk6gh78JPs5EsJaF-0Maarzc_dEwtE-u0HuEWkwAF5z-IGt_CZs4yI6-8pnPhbfU_a71ORVmUwBPamRRX1cH3X8XWvHQangyujH-YwVjRZHtEBoVXWWIhKLH3vYBVdCSKqCkrq0',
    alt: 'Stilt fisherman at twilight on the southern coast',
  },
  'review-chen-family-portrait': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdCpzRVKNFJUFO6iG_6FBCJV2K08pK0jdIvb4DRHsEad1Yp6rK2qFK-MZsIIrFPmgCdUlfpuvkmN3R8ZFxYF7iTY_7evCjV8dT6TGdZ2V85Dgb7ZIVZp2vJe2YSPIUedm8peqi85kqrzChHD7znj7AY0fGdsub6_PaLVNNrtQUesDbWMIQjsq0JEPgYX2vDoF1N8QfUbVz5ZWAaWKe_RjEeeCCz5PRWhqbG9f483K1icFhY4swxfA',
    alt: 'David Chen and his family on an open-roof safari vehicle',
  },
  'review-chen-minneriya-elephants': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAt1r3hZhldZziPWTYSKFDOYW5W-sR5Ob8Kxf43L4DjQ9nQKcAnDvo2a5jeuXl0RZjSCfSOghascHZAYm1CZws5_NcPztVc4XBj3H3GL514V3iUxokbPOIs7VKsG2Eq1-64u_5ISCzoa038OQmsYOHYTMbpyt8pYvCubKHl__Q4porkv0zbZ2LaT8XJr6racQ9yLf6bbDzb-22iLtGBTQAyjqG8ZdKjf3fYOw8lLIYkJ1qEhC5vZ0',
    alt: 'Elephant mother and calf crossing marshy grassland in Minneriya',
  },
  'review-lindqvist-portrait': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3zDGc39gOJ1jEHtrtMsWNdvggna4AvYoNIS4ONIf9_iTfUdKuyz4SLr_F4_XjHR7gQpdT0xH6BoAjlF8bJbhZiuFz_PjGG9Icqp0waX7MuYTPmU31K_6som7IG6_KGBQK-IdOyvVU8ZRtybuvNumSscfXib7JCH9Qfe3AYNEI8UOuhZ-NXSi7O1b--rOd5gZ3ZawFXunCcjqV3V0f4ymcSE852fqevUfZMwuYqPm2s4bvvLWsUas',
    alt: 'Marcus and Elena Lindqvist by a colonial arched doorway above ocean palms',
  },
  'review-lindqvist-nine-arch-train': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_WlbUXh0X8SIKIsV53NGtwb3_a8CLLmZunP0eBIVLscD1vcWJQiX0eU4t-t4p-a_dRBLVu5Iarp7ygD65tqtqXWb97SYTC0FcERRbYxqCh78st2m_H2isfADNTpe_wcg-kswmjcSVmFjt-vd3VLF7Jn19_oVlmcBIxC0bpB4KkX4-vUY1eI7hQT1zzSVGLEdNH0198Ak_5Vl27cfKlEco1sVjoABaGJ8c1abQ-v8KG63b-urelF0',
    alt: 'Blue train crossing the Nine Arch Bridge through the tea canopy in Ella',
  },
  'review-von-berg-portrait': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAudEhL_BrC-x7Sndmo5HHbxz_xMTaspnt3HNVDrR9bWP_B5X4tPCVT9uftB7GnLl3MRdN9MIbLC0T5u18cBZyHWw4Jd2UMnonoB3q9iymEoY_HCNh7AV30W70xzCgmJeqXZdHB19fPTmnYHsCvUcQ0_bftwyGoAIwp1G9p_nl6ccoSJoi0MFOS2fgGoYpFaj2v2XdJcc8ewRNnZvZADhOgyHPpj2m_iDkeCeZxC3zSk_tuogVuM_U',
    alt: 'Beatrix Von Berg beside ancient stone carvings in Polonnaruwa',
  },
  'review-von-berg-gal-vihara': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCreMhlVsENHlWt1mWpjL0l5kACS3qvdGIEdnRpjAq5syUm5SYSEhfgaCf22O6aM77YOADQMCbx8pj4XQWbYnpfl3xcUeO8vu2cinbbkxoZNaTLg7NTALe49Y9r2jgdrbNK0u0JrSurvq9vj8940k0QOWMYl9LdHeOAhYu1UynzDZfOOqGYdU-IUirC7xJ_oIFbgr1DuD09dGbNFLMAUuOEOhEvHEVG4urDTHIVl0OKIoqv7kI0WSw',
    alt: 'Moss-draped Buddha carving at Gal Vihara, Polonnaruwa, in morning light',
  },
  'review-pendelton-portrait': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD73_oimDOM3jtrpjxpz26qlWz746e3vVIrkZzbJG208rExTmvXbrVYslOamVVo7F5n7tluDW-zwLwz9BKVjEAR5FHkVw4uL2UfHyPZxjoWuE0Kcc7FmxN_Z3jdvSQoRZH6NerznlDgFxgrBFEDMHUwhLQ0s6fYAhLG7xB8q6Km7ZQj5OmqWikZabS3Q94XNFlJ6sxlyElRhFESzdJJ8Kk7CoklNBUyyNrOqIetGKFAcv74gaCVQQM',
    alt: 'Arthur and Eleanor Pendelton on the Galle Fort ramparts at sunset',
  },
  'review-pendelton-galle-lighthouse': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvo4GKbtKkN6AyxhmCbwmr-r52YH-8iFpWjxs7nxgBzQvmF3cXFJCM4Mv7lMtBahtJJQU-fEngrSh3DVkn94YIqVkBV25WGUT6Hu7UNcFH-R1IqLh8KGcO6fXf9o0fX_IUaAA7uWDYV4qyi8BEZf6Odgkt9UjzpP22RLgWpS9PCVoEPY5exoLC4TSUoMndDHChz89EQO-7VajIiWNlAOMqzurhYj9jCu6XYTRCnFyjkVc5FIQq9GU',
    alt: 'Galle Fort lighthouse at sunset with travellers on the ramparts',
  },
  'review-jenkins-portrait': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATmTkNZQA8UoqYBnSGgVDMgwbhOWVQUJqhy5uuJzbCpoA0I1_Q3NlAqaZoJJntCPWyF30b8zUAyAz4aXRIhmnD1lRnXie3HbSztFb7TqWv0g4nTvb5M6RfwJJyzrSZmZ0amNwL7B6EAHBmKzrfw4gVeHp_xwSml10iJehUnEI657QDT6wDQYgO7NC1micieQPKxtukWA5o9qrznNICn-JgwXer6FU-gOZIaOpfHH11f_qMZSTViZc',
    alt: 'Sarah and Thomas Jenkins with friends at a spice kitchen cooking class in Kandy',
  },
  'review-jenkins-clay-pots': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSiiXuKUIrjhn5VqtBJ3qc-4tjracYU4UVboSS4r7xrfeTsItWYUe3v6prXjUnIsVEOwySHuadGJU3xNcUNfEE97SWk1mVJ0ku2e0nQ9gYB-0SRGsuugkOnogldJuMiKm35v-7lYkTNRDg1Z1loPBGfRzogjo1RHo9eoFBUjWsdIFukoDaLMqFPjtscv5VXj-cLw2dIWPQIxtf89-qbUwZ_hrrv2CNaxFUWIICPZ9BHmCAodS98j4',
    alt: 'Clay cooking pots simmering over a coconut-shell wood fire',
  },
  'review-mehra-portrait': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjIU3qe2wd5qKTePgPZr6P6xEnRN2pvbVh0-o6jtSQoqGLhYrGkC-HjyoAQ7p5KeWN4ZzdpqJQU4hH0ivovS8e2tGy9RcLxB6MZgX0Gg5RJicH4z4HIeFpmmzbkGP--PJzgWXnzwSVPDeJ8d2Be2i9hXK4MrvpTo8AqMj2tkaHFbzxh1-5iGwSd6h8gN0cBy8_fRyYgD-nRJOHl0ybXhIH_Yt-_e_V2WnS8UWx3mkAyEQAhg63QTU',
    alt: 'Rajesh and Sunita Mehra on the veranda of a private villa in Galle',
  },
  'review-mehra-bawa-courtyard': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6bcg08OYA3AiQa9WZRFCYXC3Xsbys6fmDwoVaFu_OOUpJDDbn9oiovlhiYGrQacs3WSPzoavMFnY1ti5rT-ejCnBC1WQqCcRg0-5zRun5pYCKRvDOTco9gOpfD-lm8740L4tLQLgPycApUXK25vzgjRC6fovBXNOsuIg0DR9QEtVa69oOHugjK_uldQi10CSVyjGSZ7a2FsMtYVt5hqFJZW1rODrZ5MCM3LUVVekrer-5N-8pJMQ',
    alt: 'Minimalist villa courtyard with a reflecting pool and palm fronds',
  },
  'review-video-lindqvist-poster': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmSjLHTl68t8nP6JS1q0drRBYjXGbV6COTD5tq7foNqh-G0pLTXBkju4SSf2r43Fwg3vKe1akAzaae5rJgYevpfasPvf93pTMApTrPYgiwwQmaIRdV-GfMtfTROWvCbJjhM_b8EaQzkuz1w_nhLmtXSO2mjO-gduFVLwpWbxRA9ANNeSMPa8nOkuLy2bGQPYNeh8gMA17v7FCAxJE1c4IYs_GgBnq7t_6c4r3Zj3L_6OwVou7GyE8',
    alt: 'The Lindqvist family laughing on a balcony overlooking Yala',
  },
  'review-video-pendelton-poster': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNTfqR7V8NiM0fZmhPhV8Qq8g6gJyeOcLEjNNXAAgiyylL7IZ7UWxEBrQKr9Vu41npsJUUh4ZLnbP-keR_HJnlN1RzBbT7MbjMNcEgc263AYjQYBof3wETufxHqXZ2DaDzZ3N3iQxMzWm7QawAmtco_znOANUFeNjO6YRR6jncOTSo7ek93ZPTMK_WUsDoGatUMAyStsagBJZ1IegCLOmI3PjfUiZN5qdxMZ2DwAaE0VavlM0huO4',
    alt: 'Arthur and Eleanor Pendelton taking high tea in a heritage hotel courtyard',
  },
  // ---- Corporate
  'corp-hero-boardroom-tea-estate': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSP5oMl0APAR8G5KBHoit0mZdnNI1IzalnjpvApepe81jPWz_ZnGS_oA_gTIEhu293WjlFDetdHO47zSa3nDrAK9QW-2s6Z0vGt7IluYC_lsHCP1hfQyo3VlEAxcHoO0yZdrGKtcWybt2OFwn5bgEkfNAfv-FaW9Vb_bAgyg5tcmkjonvCkNyN80QML1feRWOzZplzIwe8i1_DVMdplafbv3vgZYd0s3jc7o7YbpItwhMtPiPx34c',
    alt: 'Executives around a teak boardroom table in a tea estate glass pavilion',
  },
  'corp-board-retreat-bawa-villa': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsyVBfvtcq2gh7Wiu7hA-tAGb4BvhpFPoiCa8LVBQbR7g_PHWXkvXUoIxDsB4sg0rTxIvi_75DjGOfyIrJfJ3P7mNT0QUbhGJc4DL-UeXLbs6_nP8EbZik5Vzl2kej0QIWnDK2IfcCrlpNi3Y2axgZ8V8xAtL4h7s7dSDpgu_wTgV9bvCRBBpY__coETAxJueYSlfxiSLEpBJBYO2MM6bR9OMGBuHQBho9KpbsqDfS1YADAHemxkE',
    alt: 'Geoffrey Bawa villa in Bentota at dusk with reflecting pools and a dinner table',
  },
  'corp-incentive-observation-carriage': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFZe5kZXwPvreGftYkIkZmh0XNwyuMHP8OTndeM02S3OKANH_ud5EcblZtoLXo0q7nfiNkHnZRLKSVcGBHMPo2IY6XiiBHBe62WzaHfqBcGookDhFLtvMioCqK3ArQYULz3w8HP5rk7H8nkNWnYwtAX_Ggr0S9wGKWFgTJGYbg8SaXZxbL0huAgIeQg_amqQSZMVlJoE09Y4Iq_ZcnrPe-NEEAhqHlKwePA2S4_6tSMN3I1TFIF_o',
    alt: 'Vintage observation carriage with leather armchairs passing tea plantations',
  },
  'corp-team-catamaran-regatta': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC6AXohSmtdrXOt9cnZAdI8huZfK_-X6vonOAKLGv8IKlYVHFbH8U7tppNj_mjZegnc4VG6IpFXir0ep6UOnJySvSBIP9VQCj_pASJmxcnq6MFs4tNU0RyJIxstnCkHIQ5Sq1RmwC6hTOa2hZmVAA-rp4GGNIKuh-d5TvSauiqWiJyuXUou1ITSBVjt5VTIv1AFbyVRoEPuRWlr3ABtxsW9mqm2JXINx7qO8vYE6PP0sCuDPRn_jQ',
    alt: 'Executive team sailing catamarans in turquoise coastal waters',
  },
  'corp-diplomatic-tarmac-fleet': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSIAQuLDot_SQuuWdzHQ-z_vUVutZZQfKGRwCnrWrYPhv2IcABRVmVNZHgyE_yPkazBQ9TnYXv60n5_V9n6pqfJhY0TMZnXdSZWXLV-sA05qNsGLD2Kb5aMDY-qbULFXWr3Q8StOVIidQDB4PlaEI-C4bLATlaKkvdbdqLlSlvJyaX7EL5w1UZ2lbKk_M113yR05SiGymQu3aIZNtMqeO-vhfmk1ZSCLG5iZhZngb3VtVbXQRpHts',
    alt: 'Executive fleet and chauffeurs beside a private jet at Bandaranaike Airport',
  },
  'corp-academic-polonnaruwa': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOBGIHoXx4gS-LubP3tn88jzLC0rhKKRJ89U9eS82SV8j9upcwiEZwoeOtgTzz5z9Ui6t2CMHhVLO8AyYtH2hp57TRijAOMAleGfy-ofViFDEyUQjMJvwCeR4fXlQfZDCsC2MfuR8VL8GXscfkuXzbFpnLkll9YpAPzA3HcG3w0RUjXJUarQ8qph4OgGOrPZPjHlDxgimHg5wYTWSkK82SsOU1OzP3UowvFA4xRRwJK6EmHlA7y3I',
    alt: 'Academic delegation with an archaeologist at the Polonnaruwa ruins',
  },
  'corp-gala-oceanfront': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAltyvP6uFGwj8omI9oDy5ESISTHwRxuYUDNolC4p3S6O3tXHkI9-gCoTJAojXiC0CR3893tlPWpQ46vnWZo0gx72uTqaNcAzhYq-DuoA6XiR-_mJcw9xn8y7nC74iiT6kbfdU0APHuBmRjmKKz1MxecK0NFdaR17BVfLCCXN75pJPkiLnc8mCxlAShCM97nvYbao8MAYc5e4yOhw_379tEnx8BD2gQ2awsVoD141oTGndC--3tmY8',
    alt: 'Oceanfront gala dinner with white linen tables at a Colombo heritage hotel',
  },
  'corp-blueprint-hill-country-retreat': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWEEf1F9EJDfY5Cq0cBf4xLvNYHuFeDqZY8eA2Zcjgr10VI2r7pvJU0Rh4W85etTGuRVcgk1NAWU_gsT1_HczUnqZplMGTFfoyCfuqE5Ux92F3_2o4YKPKcMVUv6izR_AGd6gUUiaSa5MP0vOztA2stZDAYcbF1u23Mf-P4gPBhvUILQ-gaj9FORhDIXPcdjFklOpSpl7_VqCKXwatDocdIU8m8l20xsx_6l8CQF-ja2P_AYZ2vdE',
    alt: 'Heritage tea bungalow with English gardens above misty Bogawantalawa valleys',
  },
  'corp-blueprint-yala-glamping': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcxMlOKpqWlIFygvBVR7A2KbWmGqqvLS_xIx96GA7MD7xZoB0gLhTjM8b6DkFapaI7iDPk4FFcfV_fBSFnrUI9SaJsI_apuJdDoHgAZpsk7ZoQEP4GOXRlykmbQLzW22OTOz9XV3ocVSsJqEXzNVzBWgwIWvVpkF13Jz1CkUWNY0ecX1QpQoEPFM8xgFS-DkRDFgXq-f0yKg-MrTev-UDXlneGp-8EgqblvyL1p72gbg7G7TRPAgI',
    alt: 'Luxury safari tent with a plunge pool overlooking a waterhole in Yala',
  },
  'corp-blueprint-sigiriya-aerial': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZEpiT_mhex7A-eygl4yu4QiBVyxKZkO2qV6fC5r6V9d64d6C3BVW4jhLfW_ltoDxs4Q69iXPgI_ItlSwFvrqbd26PqoZ-VOoPQ0MphH3RCbN3A0rBA_GR00riH6nsozaMt4mSa1ZX0vPiHZxaO6Hpmw-oGzyc3D4cdoX6PzEGvNRvt4dh48LfyITW6ep93khGEfY8cLha2J3NuAL7gJKSVplWxQDX7h-OnHMnbXk3PIL1UsUbeJc',
    alt: 'Aerial dawn view of Sigiriya rising out of the mist and jungle',
  },
  'corp-testimonial-portrait': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3RoKtNCIVv7-ClwVgBzbHf4U4jDS03BoV31AntdRjOHLuvNa8QpCB3rC33l6dPjQoB40a4oSARFbRz4SiMrVIY7gXvrBVYbszz0YWz8XsamSKirYlKshnNvkhs29ylOkR3_ckZU6PUtWvs4XhxjcpOywwIVeOWPl8dJYqkJDlQHFbsEduAs8VfdpGalrgs9eStSgSxl3ZKinX7tNLVUoZNMouO8OgKdUfMSh2ecXiKYUZh_2f8F8',
    alt: 'Portrait of a European managing director in a navy linen suit',
  },
  // ---- Trip quiz
  'quiz-couple-plunge-pool': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8QVtpWnXtTgGVzvrPYxExnIsO-b_chHDlleZ-2utDGQvAbm0GprpehrUrbQd_wwg8nqY_-gqBcdzNux275hAy5C49aEWFklVtwqjV1-J4JFua0DeNngdQw0OHPfT1NwzqEslHfPsr7ADLLWruM4bK68tTojkg6G6CikfZp7aQEg2ZZZ8MGwiiRJYAJpoFzkRz1RIlttJwXZed6MWf2YUxREfUXI3HvoUPfe3FqKauQ0esetsv-Ik',
    alt: 'Candlelit private plunge pool overlooking misty hills in Ella',
  },
  'quiz-solo-sigiriya': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChGv7iydk_9vRw5hGXyWFfmDtKnc0RJ8lOZ6NIu2BJyjyo6Fk4VItBVoYShf0zHtDOxa4odWPOdWUwWrubvnS-tJ5v9iRo3Qza2ksuUQx1yZl6HD7Sxp0oFXc0Ps6waLM5N3KusMojZ3H3gEc6I5KCJSRwiBTgmSwecFS9m7T2rxrHFdBTdNufFK4Eso88x972g6W4P7s-gxTZRqSPKD4UVRZRO0ZC_aIDqvUDsfYXW_KYAav5XmY',
    alt: 'Solo traveller with a camera on Sigiriya Lion Rock at golden dawn',
  },
  'quiz-family-minneriya': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-vKutObhInoR5vCvyP29mNmwadxIVTVTfYPkSx5j3O7-Mih319OokngQRLe6SfcM5OvdRg6RC6iAUPcxndPteR1rrrNO6Pd6eqyU1i3gPxFDMVJTF6HqcJyQ701B08g22GreyvBbiUd6PAMtMUB44yMrPTcosJ6QesKfpNHZh_K2mzzpspSYB9za90Z6l_roZlPqaj3lyK2aKbecsQY1wabHzmb8iY9x6duqBccOHzRe1bTyyB-o',
    alt: 'Family watching an elephant matriarch and calf from a safari jeep in Minneriya',
  },
  'quiz-friends-galle-dinner': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChvo4iu8oE4vC_S--gZ_OaPpRNlgqTBb5EroQa3ELA79ZOqyfhfNcnFntoRtMtmALdiZ5k0YvMMuIXtKUrfi3xqNNc40dj-KXsr8VajApS4pRE5-l3vSfMjHvNRHd5ZVr8xwqYcR-1cqVycKH6Xojdk-OXHzhAyFrjhwx9x7XlLmBH-4F_mLHw6xLkUZ1zSnNyDNdOV8E5nl1a1coqE4tZic4NyrK_XX4rie6ywVRsqu54mjVyrf8',
    alt: 'Friends dining under lanterns in a Galle Fort colonial courtyard',
  },
  'quiz-executive-bawa-pavilion': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDywAjMZqwnkDkHnqBP214NhYcGavNETejPHjoZ5Of0B3HSrKL3E9GrcupcJkUQ8mZzOUbl0jKk1YCv64eZbMWJaRQwAfqOKpldYUUTo1kSzugoAGjBd1RuPYjM-qDgVoFtNeLWytqMzeGdJYAK-0nspHES574Dsr4MSNnS5I-a31KsKGxyA_ik5akdKbTiHU4aMbNhEAKSkgOwGEUzgYU2_3oOXeB_Vn2ht85wirHeEBf3RsFlhEI',
    alt: 'Open-air tropical modernist pavilion with water gardens for an executive retreat',
  },
  'quiz-interest-citadels': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCvdHqa1aNP3f7UrF7y1D2hTryxftr5gp8OSeEIEDg8tzTUhM2N8P_fl6a8AXtaV2fnihxeY72P6tyayO5EHj11-MKZ9DRDun7C8oXRJHeeFQbQ0aChEqnCJS4vHX22NixaOvEE4Cj9NBdIUaEBRocX44qxNZldesYAfSQ-47eYgY6_3WGPt6rJKZd3bf3VypKN6vlihBPKeRf3FwHpYpwtKNVEDJLC-ma1ywdIT9IbVR9ZMgKvU4',
    alt: 'Sigiriya Rock Fortress above the jungle canopy at sunrise',
  },
  'quiz-interest-safari': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlDfmqJ4vjwRbCWwPNgfj1iT2Q6yr6PYVzduQpXPq70qAE4hIwqLTznjFlTqO73080bcHK989wiNl-sbHBWnKE6hG_K7F5Fe3U6rBtaUsDh5ArMDpO0NJJ7txGsHr9p_1vMk5mnfAdPM_YEu-wPejoAaOyDkeJpMQ-ejtNwY1CN_0omcbzSp-KlIXflmhnQjfRLG7WOy8HsB5BlhtQ7z0sVV0tADhrydfFEptgWFabs7Jrvg9ZLAo',
    alt: 'Leopard on a sun-warmed granite boulder in Yala National Park',
  },
  'quiz-interest-tea-rail': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXq0eU02FXUXej5FZssD2A7s_iri-qJXyUpq38IigDBtW3tCXNo__ey-jUxFLi22A7WtWonDozKMTcswS2e8fkncT2DYUeEBW8_nzbEDoWGgxHStIKCb6MJdi7YneoYCkFJl_0B8XYyEKbajrn10Ley5-seBC8IwUzH44_TZx-_VU21iWLWqWqHzrM0cDQc-xW5id_uA8OKQMTgfD5p3otWYr_FSDYL7-KDoHysV9SZDL6f7siy3s',
    alt: 'Blue train crossing the Nine Arch Bridge through tea plantations in Ella',
  },
  'quiz-interest-beaches': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxToyZzRqszrpaHBCIGrdz7AmHxeeE8vtHlMdMipgNYtyinD-3fiJucfmOSpMp7hnroqOy0siteEG_vawXjGi-ABWLZTkenIOwuO-Spt8TGm3wJ5yN176P61V3dxm9z2-iJli5r6LlQ3L110U34fVdUqgNusgqHGhRgqrcb4fkaA5L9HQKYTPUVIxZUJcth7WzcaJPm27mdBykqpgdC42WiN4iKRwCq6-Ew68kLyJH1BpzVwq2eZQ',
    alt: 'Palm-fringed golden beach at Tangalle with turquoise waves',
  },
  'quiz-interest-trekking': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzvhuJ3X9Xap9ip6G1ziy3IgdWlEB7UmKs0zVzDMRCjPLYbW7vlAU7Ob9FQT37VXC5p6ZzvFeZEoGz9glOpJ2tfVir9Xxh_jyoMd8-snrmuKib3fsBuWubv9mZZeRKDesjIgs_PJbmpKWX5NCr32VatiZ41xkA5Zdb7jRLEAVMYUgwTI-20Fi3JxqAS7nbjjuY2Huk8apbKuxnwz19QrCw49A-wqEx_aosGUfQVwexBW-YsdDNlVI',
    alt: 'Misty cloud forest peaks of the Knuckles Mountain Range',
  },
  'quiz-interest-ayurveda': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHeDoAMs1NnKi40efJuPeunb45ePWQIinJxldEz_DLTzP0LkTQRPguOPVyMtGafEr8CV4p90w9U8yFmADGZGrsBtGdiPJKLpB3e6uIcSJdnwqgxqqt--lemYczKyz7g74OO3eArgTRpDoT4rl7Lw2Pwfaq_bI9ox3q8QJRLFvrUhrTIIAHFBFf9PtS1yRXyaEqZpyM5nVYTB_hi2HrAOVs6XzuKN9fikKL5ARMdO5HO6olahJRuhM',
    alt: 'Ayurvedic treatment pavilion with oil urns and lotus blossoms in a spice forest',
  },
  'quiz-result-tea-country': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDapjrpPuDvWg1eOx6c6lXrNj1ELvK1JOUUe2k1aSgE1cv7LUkWwZumqE3Wn2Wq59KAtnb95AJZfkh476ZIMGjIWW4kR2i-w2Buk1uBQ5YoVNs68wbqzTJUFYPbdDrBgDAQ4qoDhuFI3xTK8tHYztBnMSrSvptbdQBD-3dE0djAZ9ydoKuU7FTniTry19CEvPGwnLgLU6Ib_WeAtzaQR5bcVxwMoI1IbsWJBuGIzxeMe-fzFrcVD7g',
    alt: 'Misty terraced tea hills near Nuwara Eliya with a colonial bungalow',
  },
  // ---- Plan my trip
  'plan-tea-train-vista': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwkp5OLFrVfs_dC-V-VzDtiu76FzPmscTzzHk_caaOakD1TpXqPkToHU2sGWhqXOescsthyqaf3NKUhOV9CkDWxO37NgKMkajVNP7Y77XzHXy8dARB_g6PfKM9--1-CprI1pvG7W8l0qLJcKcFwZlCOBSxvlf5MAI8hnMdDcjv-xBN66vLOqcK3li-qMFqasobrV0FlAo9XnKwkPdUI9L8wZx595BIrCcov3rF047UiKAHzaubp3I',
    alt: 'Heritage train winding past misty tea plantations in morning light',
  },
  'map-islandwide-placeholder': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYFhsFx55z-dlSGVssIFtbkvIiTiGUb5oWuE09lVrGmCuRDYuFAnSj8blryQZeMRzwzQS-_eZbfMEs9xkZeaFdL4gHPcajO12iCs5SG7m2UQRBvmnVOhijDOLc-wh1PEX6VCQlKvZ84-MHhHS38hOi8AxKq31iNYVXYJK84YLlQC2CNU7RUpMOA4ZKoNRPjpn9DgCk57L5Z5BbG0y1K9C3848FHwtDg8wqvqOzN96mcM3R5ayolLw',
    alt: 'Stylised map of Sri Lanka showing the islandwide expedition grid',
  },
  // ---- Responsible travel
  'responsible-sinharaja-hero': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5w_bd4Tc6S0ZqqRmw0du-MbES8dOWE_Kl0S84-s5bGrdXLaMhJnoybZfuqm9t0DefqXe9YHyUffeTx1bUURL7StUdktKWPIEneaUafl3F76zZYrs2kPm_RqZlKf41VQlAmaiPjKx4koLV9jVmhUgHgwSXtK7_XyfFRa02iXtbdj-sPdi_wz5lJEdoKzY_WRy0_Gx4EC7pvlH_5MhFWJN7ijwW9Q3yKCA54JxlibWC4r3cXAEe2_s',
    alt: 'Morning mist and golden rays over the Sinharaja rainforest canopy',
  },
  'responsible-dumbara-weaver': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnV9vSCpZ_d5AG_ZDffUARJgueEs_AyvtdvzQW7HcreboDDIqvp3gljXKJlx8RksJdxXtB0aaY0qgc5OA4aXKXTtkdyFuMLG_mwgpQKBWnFOcoFOFPohYE0AGiquzpUES4VSnndLGNhFqzDHXtqFx7H0PkzNBHerxVehuacmIU_z3FgNpvL633JCAJCxZn5FLN_eefd81JhzoLnutfoXwOTUydw5PvJNY4SjNHiTsHaHTBSYEh7Mw',
    alt: 'Master weaver working a wooden handloom in the Dumbara Valley',
  },
  'responsible-marine-biologist': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq80903SL1e7L1HtApXQqRV1zk1U5fKTp9Q1T9SqtV1LpE-IBSGZuzqdu7PdoRoNHOZKgid97KvVWh9BK2Z-O5IlK8FugXJCve-rV7Vs1R4VuM725HKQceGhRjaFSl2BMbKRulQgV3c6ckuELslH-TNJHfh8rFJpztg57Nvzsv5fnoF3edMMKsjcOvsnBOd-BFPMpA6Ks2JB5vvgKOv_Hm2w3WHbWfAFKumeEhwOt1ZfBMaBBTEQA',
    alt: 'Marine biologist scanning for whales from a research catamaran off Mirissa',
  },
  'responsible-knuckles-sapling': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyDVIu9cLr5gZXOxNecL8cz9dtEPI1-WWptz6RRoEEE6Db8xxWhuELFc6-3sfgufEFbp58o9932P_Fup_tJPJ3E5sePzPAvIOE11mMnnGYOd_OfIYIfKNXbG1hjYGZRdAhEN5hDsKyxz2fDQ7x2ZTCaZhmiM-YQBINKv5maSmbZTSiNdD7TIVML0h5Kt4w34sr4-iwc-IZMPsn0BmZJ5NQ-2kKTFsBtyIiNO6UVswNRk626aalgrE',
    alt: 'Hands planting an endemic sapling on a misty Knuckles forest ridge',
  },
  // ---- Travel guide
  'travel-guide-south-coast': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZmoKsEEERmOFqf4osVFynOs-Dqem9u_fAHgNJtn9NZbWxXNw_zQzobA9nbcWHQL1VSrhuoZWOrxZ9FYT5ypvgCfyIFMaulacmtaM5I_Gvuw1WKzgp3Orev12_BWUzsNBfvJlaNdfwFWZSicSgU3ACft2oEftLJZscovIbqqvI2x_14umLWeScTXxSo3aifxN-eGV-aBeBLLMmDcKAHptOt_U47xr6y7oJMWMsV-DA52NAenpnOus',
    alt: 'Palm-fringed southern coastline with turquoise waves at golden hour',
  },
  'travel-guide-tea-country': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMGuf1NgqbUspPXIfWLcWrqBr2yp4vvC0A9adoFLyzs_5_QwiP_aKq-f56FGmFmUlVvpyiNMDcHBMHTOmZfl8ZHhmYZA5tFfaMnjL--EPGU7X4N-Dd0I35Gy_b1kKDxDiVfTZq0lwwruhqvqHpC6H-L_qbfshswg5rlRvNqBiq8Posgll3bDuc1qYrfRCl5HoH-VhUzi-OxBLBv1JkX0twbWBZPfIihB4FL97TZvkKhZGHSAwBzeg',
    alt: 'Misty tea plantations and a colonial bungalow in Nuwara Eliya',
  },
  'travel-guide-sigiriya': {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxwMw-plBTuFYO-OH3giXU5JOQyu6AG0fHj80STT8owZf4hvMueJLrjQ3TQHBcHiwRp12ZEUXltRAFM9E1bPAzOTlW1fV0dlLWeYZFI1rtm7XdUmP_5sWFfUCZmh3QVjmlJgrcK1tr7stKWqzaPDJiy2ixcCUI8lbctxb9yibYQJ2EZCo4tXmdF94EEYT-zlT4yRbpvb1cxIjZ_aMMTc80U52t_9sJblC5MB0iK6TdFZ7iPNaRPsY',
    alt: 'Sigiriya citadel rising above the jungle at sunrise',
  },
} as const satisfies Record<string, SeedImage>

export type ImageKey = keyof typeof IMAGES
