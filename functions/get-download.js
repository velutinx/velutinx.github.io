export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const orderId = searchParams.get('orderID'); // Use 'orderID' to match your frontend

    if (!orderId) {
        return jsonResponse({ error: "Missing orderID" }, 400);
    }

    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_SERVICE_KEY; // Use SERVICE_KEY, not anon!

    try {
        // 1. Query Supabase for the order by paypal_token
        const response = await fetch(`${supabaseUrl}/rest/v1/successs?paypal_token=eq.${orderId}&select=cart`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Supabase query failed: ${response.status}`);
        }

        const data = await response.json();
        const order = data[0];

        if (!order) {
            return jsonResponse({ error: "Order not found" }, 404);
        }

        // 2. The vault with all your Mega links (unchanged)
        const vault = {

    "PACK001": "https://mega.nz/file/TA82HZoR#9xNyTpRStKfPIY0rslomQ6qhceMnMC8VLeECRsAOoSM",
    "PACK002": "https://mega.nz/file/mAsjASQY#8qLr3Yz2dK51AO0aVnQoAwIVoGGU9UVOyucR0oif898",
    "PACK003": "https://mega.nz/file/DNUVDZCQ#KHmy2DGHQQuja6szJTh4JJWQWRfOYaPUXifGNO_EytI",
    "PACK004": "https://mega.nz/file/mcEC3DwL#BVgaSySkiZVN8jkAU4rMjrGoBWY6WvRhrseN-fKTbb0",
    "PACK005": "https://mega.nz/file/SFFmHZ5Q#Kgpj8ElgS3JPd4Td7VOUVUWN-h-px1fBbJK8OxFkG_M",
    "PACK006": "https://mega.nz/file/zR8xmbyL#4IZsv5yjk3vRHO1TyySQe0PKtskZuw9dtQlXTmVh_3o",
    "PACK007": "https://mega.nz/file/ud0gnKwS#swY_X4b2d4CmZipQU8v6q5jeHKGHJ_zF92iu6xHK-Rk",
    "PACK008": "https://mega.nz/file/2VkAVJxY#0xpaw96QgJ4Sozkw_xt6bzy0eSOjYaGD79jVFDt1mWY",
    "PACK009": "https://mega.nz/file/rZsmUarS#pkFAcT8HYVQ9TfNLyvs4DVXkgOsV69fePzWeQGUJlpQ",
    "PACK010": "https://mega.nz/file/iAk1QZ7B#5B6IVg_S17DsbXhcWA5m6ND0Q96o75YZZLKaPtQDJ8U",
    "PACK011": "https://mega.nz/file/mQlzEKLb#SmmOjUONmEODw97PET_uayT9Ok-Dl8Ib66R7KXC8tE4",
    "PACK012": "https://mega.nz/file/CN81TaDA#4p9xrDtZsADmuCBpfZHXv8sElWB6WrIMb8yGhy16chQ",
    "PACK013": "https://mega.nz/file/3EEEFYgK#zgFgCcGkvHTaUsIWBYavsFlJst8dOvKeuYZI_9-LD-Q",
    "PACK014": "https://mega.nz/file/jIkWgTjA#cjYmDTbCVA_vi-5m5Q8WSMY2h5gIWjKkApo4qD3MVKE",
    "PACK015": "https://mega.nz/file/7ZMgxaQI#dKaXEkuhA6ShMIxalQF_eyym6JR5zU-RQNcPOymGWGI",
    "PACK016": "https://mega.nz/file/vUVhSLxI#HUgQg2fzzeYu4a1T2Wnz-TUKEaasZsYNsNzDfsDX6As",
    "PACK017": "https://mega.nz/file/XYs2FDbY#d7j-Yk8YtgEAH0uNtf4ge3Js7yafnW2fRZ_Cob2dVX0",
    "PACK018": "https://mega.nz/file/HcdiBZ6Y#shr2Mg3mGw6JzFmC2c-aci_qqgaE-YBfJ2Yg8XsFguw",
    "PACK019": "https://mega.nz/file/WdVkgaiK#L6Hb5KIVMDic1gvZk_eiVgwhLiJmEFIY2DMZGUlhSD8",
    "PACK020": "https://mega.nz/file/Dcsh1BrB#xi5uRcV4U7Kkzysr2Qeo7Ff5oeUPK355xzfSSbc5rKM",
    "PACK021": "https://mega.nz/file/yJ8jVTpT#TGCOsOCphQOeIh0KGW0L4_k0fh9jxp-WcaFD4nY4HJA",
    "PACK022": "https://mega.nz/file/GdsBCbKB#y8UYKJxLqxFaq1EcNuHILyezURmt1yBs06T-DfXhkJs",
    "PACK023": "https://mega.nz/file/fM1UnD6A#OiuOJhSuEr4DCsrYkWR7p5IKcFtdPdpO1hfhSqXRrNg",
    "PACK024": "https://mega.nz/file/GZdmQA7I#JVmCZ4e1iGz6UYZPFaynR_EdFzc67dfSKrtp0Ev8ZGs",
    "PACK025": "https://mega.nz/file/2ddVkbCL#TCXs6foo2Yc8sQ8J6G2gBAboRprBYKsXMTuBrja_NT8",
    "PACK026": "https://mega.nz/file/DE8ADJZR#HbS9Jc5AeVURicHX5woS0vZTMPWnl1DLFx6K-1iHAXY",
    "PACK027": "https://mega.nz/file/LN8DUKpY#eaoprAUAJWsbsv5AaFFAV6oLePGtUWjTpW7KWu3RGT8",
    "PACK028": "https://mega.nz/file/jRdUkZJR#DeuXVfrmT12K0akcNVl_mhnVkSK1b6I61-HVq4tyskI",
    "PACK029": "https://mega.nz/file/XZ8DTQaB#fLqc8GI9nUCurZkqk6CyCktJ36IR-c0hr-rO1VlyEr0",
    "PACK030": "https://mega.nz/file/eMlABKTA#38Su111F5seD2H7NT_L9FlWZzaguaH7iYDtMFEB0Tjg",
    "PACK031": "https://mega.nz/file/nFMBDD5Y#-wGtMg_h-yLGZtnMYbfeXcwBdJNQ8qzsQ1ifE1CpNyg",
    "PACK032": "https://mega.nz/file/jN8QRJyC#wlRJ-LFexN2QDWEKViKMYNiGor4eaWf0QbRfe29B6hM",
    "PACK033": "https://mega.nz/file/OI01BbDY#_TNjkK4zgrF38fSJenKakBND1F7eAuoV_gUfThAq9m8",
    "PACK034": "https://mega.nz/file/2I8iDaQK#74W7zMpGSpPjl-UYWGp2n27aiNU91V2CHT3V5wycreg",
    "PACK035": "https://mega.nz/file/qR8iUawZ#SL1XRIostuw0Vaab8-gckVWQErO2TNf1seUHVhJfyUs",
    "PACK036": "https://mega.nz/file/3MsQkIzC#vXJAcZlMXZ6s8a8Y2EAE8IAh-CNbxEgLlqayZdM0sa0",
    "PACK037": "https://mega.nz/file/aEkkEBhb#M4e554xPhjXcWA48MrlE9xy_eaXWgRVaJG7b3BmvnQc",
    "PACK038": "https://mega.nz/file/PAsQQSQb#hKa8CEpTnGtpqeGuEhmRSsD0piBISiY2NN8-Ub00Sbk",
    "PACK039": "https://mega.nz/file/SQsxgSxK#SG_fd-Jm9SBNVNr3iXjfUpSM2IbkLyLessF-KbD8od0",
    "PACK040": "https://mega.nz/file/iQNxHADT#XAi2-R1dxz9Uh-RQmDa-3pHewBjT9FWFXKPlww5ZkEA",
    "PACK041": "https://mega.nz/file/TJ8GQYxB#iTibjfqhJTz19ibZvG_ADQSjOVz8V-gHhankHwppX98",
    "PACK042": "https://mega.nz/file/rJl1EKSD#XBHyNzS7s5qDhj73VZ5KELW-wuAjulUrSN0lQoO6bbE",
    "PACK043": "https://mega.nz/file/CcM1zB4D#mhlm5JfBgXqFWnb2IX1pKbaF7q-pHkib03fiJnrs1Z4",
    "PACK044": "https://mega.nz/file/yYlg0BaD#6JaJwRcTKiQcIVM-PBVQPH-Kv9QzfXwr8HF2Yob19dA",
    "PACK045": "https://mega.nz/file/jQUiVBAI#l7XRh9_gyLH5xdLAqEhKkeaEbPVnXTHxmdPT8UrInKU",
    "PACK046": "https://mega.nz/file/zQlFhRZA#QK9piASsaE7j6gSGsvPUjh04elH1yvNutCIeikyKlbM",
    "PACK047": "https://mega.nz/file/jYk2xBJA#FtaRrdqClxVi5cAZPczjHIPYzQommN9_zPbB6zm-8z4",
    "PACK048": "https://mega.nz/file/XdVwGYzI#tJ-DyuW-4m6M10LrwIx5ROsPmNqe-1bQiaAw-qQvXGU",
    "PACK049": "https://mega.nz/file/3UUSgSTB#FCVQF7gXpoA_op27sKyudJo0uvmxVFvojFVtlbMRmpo",
    "PACK050": "https://mega.nz/file/bQdS3BiD#YhAIAHr_JGmMnqtpydqFsgMIDsRm7KOZUA8qxqdvVNo",
    "PACK051": "https://mega.nz/file/HV9nlZLY#3Vrj1h1Yxwuarv1sZxOzkGrD6boQdsY269r6Lrjnui0",
    "PACK052": "https://mega.nz/file/XddjmRDI#TApz0vbIcg5x7MEKq5fnHs8MFkiFw_U4UoilRVfwZzc",
    "PACK053": "https://mega.nz/file/KN0GTaxT#sp2NLQIzwAOYu5dABN-pRfihscJoFfleGiQZjzgpeAo",
    "PACK054": "https://mega.nz/file/nUMlUS7C#B0ChmjCQid9R9L5DWoiEGCSRlwBzSC6bmep-KXUZe_E",
    "PACK055": "https://mega.nz/file/iBE00IiD#uDpXBLjFnJnR5eAvvCSYjiI1hX5rx-U96BJcZL-v0RE",
    "PACK056": "https://mega.nz/file/7RE1RTIB#QL9sCg-0PJxCQrfHIQx1NMsCLT7NT5k_LqX7fyVKdyE",
    "PACK057": "https://mega.nz/file/zAU3ibYY#I_9OvUdMAR_b6KKPILpYLUWsAj2d0MRwMLpOCrTKDig",
    "PACK058": "https://mega.nz/file/7RVRnJoa#KR88m5sADcm9IgEdl4ODr7jdKVmhUj_TXRjLtw8C0qw",
    "PACK059": "https://mega.nz/file/7BtUkLAb#FhL7roQ7bvLRgi_aTfVinJY6K4h4UqfcF38TwBhqgv4",
    "PACK060": "https://mega.nz/file/SM0BkQaR#-wgHN5eTpbcGa-nVDVL2YqW8wmr2ShMiSzMENGjNQwk",
    "PACK061": "https://mega.nz/file/SZskHRTS#mg18VFuU2KkeFGNyW1RoTi97b2rXu1nbHI6oRRi-e8I",
    "PACK062": "https://mega.nz/file/KUlljBZL#Lrmy30fFNbetEXNgcB76aMdkTgxm-l-AAX_6A8IDy4A",
    "PACK063": "https://mega.nz/file/OEtRVLya#SK0grLxewEfBiBwubQtClETvZS9Ek9lj9-lMEAwxHT8",
    "PACK064": "https://mega.nz/file/3dlHTByL#e_hbpFzZtfgnRLO1iGzZd4tVADsEBFGV5k32tQzx_4M",
    "PACK065": "https://mega.nz/file/aAlC3DpL#IGraEXhpID4VgU0BsID7P2p43HF8jAAz3u8TT9QCzBo",
    "PACK066": "https://mega.nz/file/3AVgDA7K#-nGQnivorxH3tY_LbqF7xon8IwFUuHnThWapvLuhYuw",
    "PACK067": "https://mega.nz/file/CccHxAxS#rjR03rGt47LyGjJL9ex7VNO9Ne4aqwwNzJSyoGhFoSo",
    "PACK068": "https://mega.nz/file/PMEHGLAQ#vH91HwKDxT1qXMByaUQnbYgdVl8ILZHLxF_sQFpxCLk",
    "PACK069": "https://mega.nz/file/3ZEhCJ5a#w0Wqyxxq6kroTDmKkPLR2xm_vyq9z3lJU91hET4WMQA",
    "PACK070": "https://mega.nz/file/uZtXXKjR#0UrXf2LKszMprOe-PfKJpVcmhJB8ABMjjm0WlEyIxEk",
    "PACK071": "https://mega.nz/file/bAkjXIDB#cFzC2_VyMYirbKpmDwaqE_5kyKZr1EB8-4tNsFo0RCM",
    "PACK072": "https://mega.nz/file/iQMDXRDK#OH-_6bJB-KW44i4JnxsuGJeU3vbhFBRDseEQO6ZYVfs",
    "PACK073": "https://mega.nz/file/CddwABoJ#ro9mwi5hhtcqbCEq-gSFrnQJS03f_wMZeBv5ovEZ570",
    "PACK074": "https://mega.nz/file/KdV3lJaQ#2f_heqx39MkMPH2FrhdOuffCmphz_a-bc7ZCgz6K5Q",
    "PACK075": "https://mega.nz/file/3Qs0QJKI#qKnEJXoIk0egEWoHsf8GJDZ0qCeM3UlYKc3HVaju8b4",
    "PACK076": "https://mega.nz/file/qMNg2YyT#5uxYRDUszUpptiCT4maOU405HtomhG4LIUVXz5Hfy38",
    "PACK077": "https://mega.nz/file/KAFjUC7R#OVw3VJH9rhX352l6WGf-eQTr8Q2mLOBPsUEOf9o2jN8",
    "PACK078": "https://mega.nz/file/eAE1BaCL#eTuwWYZ3HVg5npj14KAOZjcT5Kk4BAy40h46NWlaoBQ",
    "PACK079": "https://mega.nz/file/Sc1yRaoB#cvKOvY94_HFq0axh1Wdb9iCc_dSE3AkKdT32DWqu4eg",
    "PACK080": "https://mega.nz/file/KJtRza4L#pdu-S21qsXBm4L8MQxV_gQblxTJnf6zWKm5xY3RDWAg",
    "PACK081": "https://mega.nz/file/TEEy3IID#waAKoap1yWmYVpxtW1cPYNaU8wK789WgIZhLqvLpYIA",
    "PACK082": "https://mega.nz/file/nIEUkaoD#I5hEfYMpacNPTtN-tVKK1tKZqYaxV7Dyn4uiNAfcK00",
    "PACK083": "https://mega.nz/file/rUNDlCSK#UQlRX91hCadASRFR_MUPsCxsO-_mEtLYRrTVv_c0zRQ",
    "PACK084": "https://mega.nz/file/3E8lDQBZ#4L4QgeOV50LdC2KpIBaruibfQxFFTYD8CL8rHv6rwJM",
    "PACK085": "https://mega.nz/file/bRFAAIzR#B4DIZovAWBTOrLQyYH8BTom1qYO23gZ2ZQhAFg-ViEI",
    "PACK086": "https://mega.nz/file/yB9yjIDK#NbfmxyTTCMX5NuCPKdazIyVrg5ijBRgyHPA3OrGlbP0",
    "PACK087": "https://mega.nz/file/KY81EQ4Q#M4xeSffr7z6KUu1r23QkPT0aLMRQ9LTPKdgrkC_pXFg",
    "PACK088": "https://mega.nz/file/rE9hSLjI#RxF4Bdd9_sUm0ZIIaD_a6g4bnBWGRSm_Xm_i7FglXwY",
    "PACK089": "https://mega.nz/file/PZl1yLJa#TK-32DCyPn3EDN3wkHyANms4KxSayJfcLxU2sqEgjP8",
    "PACK090": "https://mega.nz/file/OIkURLbL#hurDtuum-Vbkpk2ZcBgTqgIKwGXlvcuvBN8ghceNXA0",
    "PACK091": "https://mega.nz/file/aRNiVSCZ#3H7oRyG01zCqgYXS_L3Mvm_vC-ZNn5LqfVdR_Z8NxRE",
    "PACK092": "https://mega.nz/file/KJsTSR5R#t7vXJF818r2w9jh2QZcG37ccDQVsiYqkGkVHi1SCFRQ",
    "PACK093": "https://mega.nz/file/PU0AWSAQ#DfSDrQdi9yd-VxV-mA9mCQFitJMi4wMVYreKbx8zU38",
    "PACK094": "https://mega.nz/file/XVVQlTba#tGaAsEbivfdhQaRsb077aWUy5NNrl8S3AuMr_1iqio8",
    "PACK095": "https://mega.nz/file/2MNz0apA#Dn212Blz07UUIgv1LzthBLZIoLzOcof0uQMFCYc0fEQ",
    "PACK096": "https://mega.nz/file/mdlxBbhA#0O8kz1V5FvRg2WVQKGuabS8kBRaCfly8-LTvord36_I",
    "PACK097": "https://mega.nz/file/HY8SmTJR#3rKf_nvLWMhAXgDPk5ODZkN1LsbBKh3VypJj91NYDNU",
    "PACK098": "https://mega.nz/file/WBtjWb4R#VOb1DySXO7P2HhrP5kcwzH3-e26TT79Gdekhd3qkCMM",
    "PACK099": "https://mega.nz/file/OZ8RST5S#3pgzjk6EGSxEONp-ESWIY-vDhMoVYhSpksA5ITYapzg",
    "PACK100": "https://mega.nz/file/iV03DCyY#6mKG61IkeyMRCBHxGCcMYpx0BB8dYWXRzo1ah2Bn7Qs",
    "PACK101": "https://mega.nz/file/uc0zASSR#oFEo-pNUXYRix3PUFhyVeDjzaDJGRsRWuCWkSseUWY0",
    "PACK102": "https://mega.nz/file/LcsDUCAR#4f0HnHIlAGgZSHw59SoKaXNvQEWk72TF-SOsuTw_IxU",
    "PACK103": "https://mega.nz/file/CZ8FXCTL#xWpiyLfqxOxKOSDDlewpLKSqCHdbV9CzA0mH5nb6Cjg",
    "PACK104": "https://mega.nz/file/vJsQUBSK#9aakJRVvNXyrhyUQ-AbPF3fk1gyFZVI85bf24RQBhS8",
    "PACK105": "https://mega.nz/file/OYNzDIKI#ZZ47Z0Gnntw__2upAq-fAWPJ6vezVv2QBjGqBZhLGf4",
    "PACK106": "https://mega.nz/file/SBcyBYbA#wTOFILt4JRKV1euWcuICnTcVo9IWXDJhztenJa-avg4",
    "PACK107": "https://mega.nz/file/OV9XGCbL#Q5-w9xrayne67pkOX0foXY4Mtotdfn8z2gyV0GUrcds",
    "PACK108": "https://mega.nz/file/7B8yCZCS#cfiXHlG87NwK_TFZO2tvzyv-W5o5Rrfqko5eGYtDPrQ",
    "PACK109": "https://mega.nz/file/PJkl0RjK#aGwerIgUabYrg00oY7oFjz55gwyHYU10N1c9emMlp7s",
    "PACK110": "https://mega.nz/file/aN8R3DIL#u7FoJQEPjY8NIablmS6j2ifywizCkuIzDioLGY7BlsU",
    "PACK111": "https://mega.nz/file/HRkGmRSY#oPzyAwycliiYAaOnqoyEjD4nJac2vG6ByS6x4-99MLo",
    "PACK112": "https://mega.nz/file/LZ8SzbpT#Z1mTLuELgl1PwyaILmnXBEfakNUPEFLp0XqXHM_5b8c",
    "PACK113": "https://mega.nz/file/DZ8SUYgJ#b_-qMBS3cndPICICMBQl9zDfTep33EpeYSww7yc2w-o",
    "PACK114": "https://mega.nz/file/nY9WAJYT#Cy6H5Nys6Q2DEP9LQKJzMktqNwEt1td8yI2jKWp1VlE",
    "PACK115": "https://mega.nz/file/KQtRQCaT#Xu0vn1UvRDXqXfPyrNXT47b3Sov5hq9WWue8g-TczKI",
    "PACK116": "https://mega.nz/file/HElTQZqL#l3iOhcxjV4aaVl1Rtk1l32D_dOCAzmThVpG_16rBORM",
    "PACK117": "https://mega.nz/file/yIdAyYKJ#zAZwI4S7BzCCWVngxOnOd6WT82e9Wj39ir3XEvp-DRA",
    "PACK118": "https://mega.nz/file/Ld8jUZxS#705DAS6ZHSZnu8AFTdEqEA-9Prn06QMln_e1YeDLzDc",
    "PACK119": "https://mega.nz/file/zRcCHCyZ#zIcOF3NRgkvqxuv65LihrJOjnYSttMY6L_go0UB9uYA",
    "PACK120": "https://mega.nz/file/LJkhiLhY#RC2xhT-fuWztri6reEEDjYZiqW9V56PXE7fjQJmnbm4",
    "PACK121": "https://mega.nz/file/LBNEnLLS#A1RW2LfhK7kikm-61LVyzS-36v9SQOqwunyuwHSrycI",
    "PACK122": "https://mega.nz/file/nEljGYIb#SipiRXJLolszZr7QqLAS3cDV68-TRVszuV3d4E1yrZ4",
    "PACK123": "https://mega.nz/file/ydlyVJDC#EMXEnh7Y_LGHTYLj-6deWPgCtAydLpeSpOcuvPSMeUM",
    "PACK124": "https://mega.nz/file/nM80BRAC#QXq-jbVGbb_DmybvJfbDClnLwKL8DG2QhHXFZymzOoE",
    "PACK125": "https://mega.nz/file/Cc9wFJzb#bqr6G-f6LW9_BdxNRMDOYO3z2Los4cwUCjaVSK5cUt8",
    "PACK126": "https://mega.nz/file/PN0GESJL#wCuErqCAYBbR6uKAt7ey1B0dkm1xL-vUzopBlknc2w4",
    "PACK127": "https://mega.nz/file/KVcTkKgI#FIAubwYKQFF7UjwfJFdzD2AUFVrkAJwmmFIPj1DU3k4",
    "PACK128": "https://mega.nz/file/OBNxVJRT#iSIagXR1eBMdqFuEtYcR_agAPwHjYszR9Ij-c_cMVho",
    "PACK129": "https://mega.nz/file/7MkmWRaK#mx1eDgxWeC--auNKJs5DmV3kj7QAWa3X77n2hrzzXKc",
    "PACK130": "https://mega.nz/file/DEt1ETqQ#3TzNdcyokbYslrSvqbgnLknnNdjnEn9eEccmq2Amwpg",
    "PACK131": "https://mega.nz/file/vMM0marC#LzD6f_t7-B9JRLiUa95SdbBtZxLoLVGXM7vZyKpXEz8",
    "PACK132": "https://mega.nz/file/nYMhjRzS#6eWKSVTRiT-2J1M8ZFBz8QmPXhvtMW0e2AbwUt3Q-Fw",
    "PACK133": "https://mega.nz/file/eYlGSQBa#NwyPtHXXqqmTcyqhAAPbh1TOPfw-qO0KTVaNOw0QI90",
    "PACK134": "https://mega.nz/file/qB1FGLbb#aB6f0hJfTzXNmPPVvJpIHeVCTRh6YpbDPucW1q8TmR8",
    "PACK135": "https://mega.nz/file/CJMHFQqD#a9aoIKoEM_yXPdr5kjRlEmXssoMAcssapXvOzBl1ho0",
    "PACK136": "https://mega.nz/file/aQV3nZgA#YHJb1NGD9WK67I-FHwZLPyhP4U1qWmswlzMzMwv1lz4",
    "PACK137": "https://mega.nz/file/HE9zFQCA#4Q0od_bgqFSCyqlP42u3YvK-0AE29ffzjyojYckKsPU",
    "PACK138": "https://mega.nz/file/yNEXHaaT#QdLyraYfzXST9VAwbQurSJih4Ftcy2qIFUx6IdNVWi4",
    "PACK139": "https://mega.nz/file/vAMCwRaC#Ri6JzFpFJ8jZWWlfpIOe3X-3R7nVG2-bQDbCivFfTLA",
    "PACK140": "https://mega.nz/file/CEMRyI7a#g7euNAwOnAhUJNr34o8995j7t_W4wYtYAy8eYMZ2OSE",
    "PACK141": "https://mega.nz/file/bUdgmASK#TnNMZ8tUWHaOS7hne4VxncEea5fCwLBbaQQ4dkeyAG8",
    "PACK142": "https://mega.nz/file/vNkWWJJS#nmV_sS4q6i6Rpg5usLD2g35q6vtejcQ595gD77q5DRk",
    "PACK143": "https://mega.nz/file/HAEQhLCA#hNUo7Yq4IAxmBWTg-nZknDL7Ekqr0rC8_ivQx34Tcps",
    "PACK144": "https://mega.nz/file/GAUnHA5Z#AXvOZpeL1B5HJef40Vvu3GNlPIirl5b4Gstis6TWJ34",
    "PACK145": "https://mega.nz/file/iIVEgarA#0l5C5aT_a3P4S0YWXPRcd_IwXtAm3948C77bNa5Raq0",
    "PACK146": "https://mega.nz/file/XBsSHBYa#b4v74njtgG-Y34fim89L0jLQtEmcTjGBLfdoyGb9s0s",
    "PACK147": "https://mega.nz/file/SN0CgDyI#HZZFQVl3TOkaL_bO-bHmRRUfVbVamTaNQHfM6dff9-s",
    "PACK148": "https://mega.nz/file/LUdUFCaa#OB0ng_AbPUl4FsWz12ji3lIs2NmY7gzGYCwAUuAdtqE",
    "PACK149": "https://mega.nz/file/WZtAxb5S#0KQDWtDNrodVIk-iBOJtCwY8EXC_9sj8Fr4kLcBBBEo",
    "PACK150": "https://mega.nz/file/uIVnRIYL#oq8jHIMCfyW52-hUq3Zg9uL9wx7RbUjAKgbGI1lnOMQ",
    "PACK151": "https://mega.nz/file/7QUylZoA#m30ydcuMYH98fHOQHzhJlZWUQxDNSwhtcG8lo2qhtvM",
    "PACK152": "https://mega.nz/file/vFsG3DwJ#uHhnt8LcX6OhtSnKMxQ0pouQVWqZxXSeXCu1xGeJCrI",
    "PACK153": "https://mega.nz/file/nUs1QZhQ#9lsKOevZbPvhOU4wA7YnFMEpC2-yPGCAI1krWHWU_RQ",
    "PACK154": "https://mega.nz/file/3EtEBbQL#RvVgEKW0gG6TWl3m_IEKEECeVvfGyZzzn3wutFeGq48",
    "PACK155": "https://mega.nz/file/CFsG3SaA#-2ihZYHR4IF5qgkET__k4sqPmN7WDEcU2i5QxVXAG3A",
    "PACK156": "https://mega.nz/file/DdMmgJIY#Ysk4SXCLYybZOtis2ULd4OHqh8uAkzjREiuUZo7p2RM",
    "PACK157": "https://mega.nz/file/HIUl3LQI#2qV6CTq4mWazPxmSq6Ua0ePI8EqEOifWScjpJ5UnycU",
    "PACK158": "https://mega.nz/file/qBdWgBQT#S46EQy4Zk8rNGd9Oy19rwl6rnhvvv2s8RbZdNtbKdJY",
    "PACK159": "https://mega.nz/file/CVFxxBhY#jvRkSPDnd0WktOBPRk6y7tDVknXUuDavswEw7P3DBhU",
    "PACK160": "https://mega.nz/file/jY0xBQwI#glX3l7xoU3WgS79abF28K498LNAhT1doGK4wQrXm7WE",
    "PACK161": "https://mega.nz/file/OZsxTa7J#gMJTPcUiLTwsKmTXgSaf1GvGz1gMjIchhOTapLXQp9o",
    "PACK162": "https://mega.nz/file/rNM2RbRJ#cysTKBdYOWiJP-AbzuYudvtdf78Sfc18ruvZNjRk6kY",
    "PACK163": "https://mega.nz/file/iYFyGLYZ#K4AVFbOR44JYmQ7NMpr5nb_4GuHlEbhRTAv7Kdt6YtQ",
    "PACK164": "https://mega.nz/file/rc8XTJDL#YjDXyhgBmEK0t6kR9pxAmbd8npus2l8QhVURlsjBMSo",
    "PACK165": "https://mega.nz/file/vEljGYqT#p5NWlh_XrVnmwGfE_46ySJRC-pjz7-RO-PpK7mU9geg",
    "PACK166": "https://mega.nz/file/6N0WhJrK#AuvjKD8oA8_vv8ELqPut0Dz0CbgQylAyWyN569e89zU",
    "PACK167": "https://mega.nz/file/WR9gEJAA#YLIE8metJzPJdl1Ty2Q52kLFc9j-AeJsrhFoTdzchTc",
    "PACK168": "https://mega.nz/file/aZc0DJTD#lwGTQjnlsvLbnull0xmaNIxBvCkys3FefCB1BZ8cAvs",
    "PACK169": "https://mega.nz/file/jBFDiT5Z#vTuf3KSLg9sJz4sEz0WobltG4iamE9jrvOigFrBiIaU",
    "PACK170": "https://mega.nz/file/XV9j0ZpL#BhbyAs1W3AIrNBjwjiSJI9fwselEN9HDuAqUXbn2bJ0",
    "PACK171": "https://mega.nz/file/eU1GQAIR#BTn9B3J26MCUG8B2K-n6gAt7wIZYevLyX6lxoclGv-g",
    "PACK172": "https://mega.nz/file/CB8k2ALS#hSMC-2KL2N82_D-n5u64hTuNROEN2ejLC0w09f4Jstc",
    "PACK173": "https://mega.nz/file/CQd2HCoT#rfCCBnZgOjd5Y-hLO_yb8OeaqyEJrtyfic2GeFdRuH8",
    "PACK174": "https://mega.nz/file/2JFD3AhB#LUF0A5KNkErMYRjgM1pcu6irLN1eFgVV1YhWYDagJHU",
    "PACK175": "https://mega.nz/file/eFt2lZqB#Jyas3SllBdxwrIYs4BB5ZK11nMwaA5y0pw4vnRPx0N8",
    "PACK176": "https://mega.nz/file/fMM3kIyI#N1KyTGzxvHQwZYZUqVdPadS3AnGSF_erDhOVwsSK90Y",
    "PACK177": "https://mega.nz/file/iBFlHaiK#P-cp2MmlNY5gqgt9v-xrxiQ-AM8BFtX9eSL2vZ08vdE",
    "PACK178": "https://mega.nz/file/XYkFXLaT#o6Udr2L1x0BVSWslJmHW_xKb7_Vgc1pUACOa_L4ZhUE",
    "PACK179": "https://mega.nz/file/rBtCARgY#J4aGmz6O2vsRh36Hqf_D6Nvo1W-bgqyD1WIUQOey1iw",
    "PACK181": "https://mega.nz/file/KcNhRLSQ#y9xj3R78U5EpOfNrOzhgOcnWEnNhfu5jGO0FIEqfgk4",
    "PACK182": "https://mega.nz/file/CE1iSRTB#4yqH7RbHFXcF-ncwDS9JecHxI6_xpuYzrBrPpIzWS-4"
        };

        // 3. Parse the cart – it's already JSON, stored as { id, title, ... }
        const cartItems = order.cart || [];

        // 4. Map each item to the format your success page expects
        const items = cartItems.map(item => {
            // Normalize ID to match vault keys (e.g., "001" -> "PACK001")
            const packId = item.id.padStart(3, '0'); // ensures "1" becomes "001"
            const vaultKey = `PACK${packId}`;
            const link = vault[vaultKey] || null;

            return {
                title: item.title || `Pack ${packId}`,
                link: link,
            };
        }).filter(item => item.link !== null); // Only return items with valid links

        if (items.length === 0) {
            return jsonResponse({ error: "No downloadable items found in order" }, 404);
        }

        return jsonResponse({ items: items });

    } catch (err) {
        console.error('Get download error:', err);
        return jsonResponse({ error: "Failed to retrieve order" }, 500);
    }
}

// Helper for consistent JSON responses
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // Or restrict to your domain
        },
    });
}
