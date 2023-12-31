// ==UserScript==
// @name         IdlePixel SlapChop - Farming Code
// @namespace    godofnades.idlepixel
// @version      0.1
// @description  Split off of IdlePixel Slapchop for all Farming Code.
// @author       GodofNades
// @license      MIT
// @match        *://idle-pixel.com/login/play/
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

    let singleOverride;

	const IMAGE_URL_BASE = document
    .querySelector("itembox[data-item=copper] img")
    .src.replace(/\/[^/]+.png$/, "");

	
    function quickBone(item, alt) {
        /* lol */
        if (IdlePixelPlus.getVarOrDefault("bonemeal_bin", 0, "int") != 0) {
            let n = IdlePixelPlus.getVarOrDefault(item, 0, "int");
            singleOverride =
                IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
            if (alt || singleOverride) {
                n--;
            }
            if (n > 0) {
                IdlePixelPlus.sendMessage(`ADD_BONEMEAL=${item}~${n}`);
            }
        }
    }

    function initQuickBones() {
        BONEMEALABLE.forEach((item) => {
            $(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
                if (
                    IdlePixelPlus.plugins.slapchop.getConfig(
                        "quickBoneRightClickEnabled"
                    )
                ) {
                    const primary = window.isPrimaryActionSlapchop(event);
                    const alt = window.isAltActionSlapchop(event);
                    if (primary || alt) {
                        window.quickBone(item, !primary);
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    }
                }
                return true;
            });
        });
    }

    function initQuickHarvest() {
        $("#panel-farming itembox").first().before(`
            <itembox id="slapchop-bob" class="shadow hover" data-item="slapchop_bob" onclick="IdlePixelPlus.plugins.slapchop.quickHarvest()">
                <div class="center mt-1"><img width="50" height="50" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADr8AAA6/ATgFUyQAACJ9SURBVHhe7V0JnF1Vef/uW+7bl1ne7GsymWTISgxZMCAgWnEBWVxKW6WCVbv8Smmt/NqCuCCiNi3+rFoRBUUrkIo0xQAhEAgkIWTPZJ9MZp95y7x9X/v9z71vksmiySSZ91L5w5lz77nLe+/7n28759wbegfv4KLg3ntJp25e0pDU+pJEa4Vh6YxKw9+1O7Uftxm0mmw+T5lsnrKkKXji+Z0D4fwTe4bC31VPvyRwSRKypNl6WZNN89hMh7S8wqSjfKFAWq2OckxILl/gXyVxTZTI5MmXyNOxKK32Jwv3dQ+GDqq3KFto1fqSwbUd1j9f5NK8NM+lbzLrJSaC+xSToNFqKM+EUEEi5kd0NQ0TY5E11GCWLrPopL+2W2W5ssa8ye1LZpW7lR8uKQ25vsP6xRWN+m+5LHAXrAVQA42G0tkcaXU6SrNGgBP+n3mRKMtEQWEKOJfraCpLQwntVk9a9/k/+sTndq/6169/ZEaFeZ7ToteYdBopm81JfE9Jy/fU6vV5dyiZcQeSPxiJpILiC0wDLhlCrplV+bGV9YWnq01a5kDDQiZhogqShv3GcUJyrB55/lmCBGYDnIEckJTK5PgXa6g/nCODTiKbNkdGroUY+P8CaxfMHQCyM1yGYhL1BHLvO+oOvywOXGRcEiZrcWvVvKW19KrLrCEWqRAuen6Gu32ehZjluqgRIADHoBHQliJBTB2fpxBoZRKyfJ3TCHJVEgQREldKEQxxHUvnKKc3W0b80ae58aJDo9ZljSZL5hfVRokJINaCApsorrHNNUhJMwOsHGIbpIha3c4yMYi+WIlEWw6FSdJrCpTgNmhaQTgdbCs1KmwPh9IU4JPCidRG5cDFB7pC2aHdZbp9Xp35WpuU/hQ7Zb3dqJfsMn9VFhxEJqFX81eHyZK4x6Pna7VaYbqEuYJA+RSWvdAWcS7XaWaUHYQwZZGMRC4jDJviZwDFZLFpYxaHmIxwMkfenOGl6pY5N2zevBmKedGBX1ZS1NRYdK0m+rNKo/bdDRbpM5UySTY2JUa9VvTmQJrIoGdFFlJmQrjSILLirw4i4E/YGQsfApuPEFgRM5sp3oawYc5wXSqTZWIkSvJ9a8xsriTcTzFnouaTvLEcBRNZCqU4ZE7rfljR6Pib7dsHpi0qKxkh71sia+So8Z9cRvpqe4VOMuo0wnZnczkWslbdzlOURZHMScQRrvJtWWgSk4AdRUPgOxQNwfmCEBaucOTMBswTtCPF5inFx50GLSFIw3XQFD4krvNzvhKIZynJ2uFOSr6MTv6Lo4Pjz/LhaUXJCLllnm3j4mrtSj2bEJiRPKTG3wbCgcCRQ2AbAhtPaUTIithKx9qBsBSAQGG+EBEhMYSmFAlI55UeDyCicnICWcjyPfizClAbvn8snadgkgtrBPzOeEbKR7La+5d2NT/0zIZ902KiTkZJCGFz1LKsUe5f1iBTFcJY1a5DSCKEZYErviEnejoIgkOGqfHEOStXv7V6CeWybLp00BAmgxvMTICDfY7iH5g0bgM1uDe0LcbmyM/OGpoV4yAhmNHEQ3ndlwPhxKp4nA+WECXTkEanYc1Cl/bDlUYNuax6kVHbDcgp4BeKJCgaAsLENu8gIiqaLGHeik5dr2iIOEd8gkJCjMMvCB0a4I2kheYl2CxZbXYajeZpMJh8xOsP3S0uKQOUjBCgym66vdFCX640Sp1cWDM4WdMT6bm3K2YpTyZ26HYjG32WtOKkVULYTxR9SDjJtj+vEYkfcyM0J8N/IqKzK449mJbIZHWQ02qmOS211FrtIHc4SW8fHsq/sufoimQ6u1V8qRKjpIQUMau9aUE04Lu5udLQwmbnVjmfcdjY+dr1itNFZFTs99CAogmC00aNo/BFaWaDo1WRo7gqnWSvb6XWuUuowlVPbe3t5HA4yWSQSZcMUnr/K2TIp2jAG6avP7Xhx9397s/i/qVGWRByMm6+YaFl2+6hD+USqc9++Y/fc/2bB4fIwpqSSmeo4GqnispqoSXBcISO9PRS0B+gm277GAUPbKEWp55khMCuWdQ8fwWl02n69kMP0Q8efZSuXLlSmLxtLz9HhkMvC1+0s89Dj6/btmb97mM3qh9fUpTl0MnBHncmHEns4+4yuKyz+Y5Kp53et2gGdbXWUZPTRLNX3kDXf/gW+vXqZ+nNrduovqaO7vmHvyenlKQrGkxUX2mnpsvfQ/3DbnroG9+g8UCAPvjBD1Ira8nW3z5Fhp7XROQFbXtlTx8999bBxzlHeUP9+JKiLDXkRDRV2e9b0NH81e986hphqgBk0j5jPWmdDfTqy+s4s7fSXJdMNmTzKuBrRmMF6vYkqaKhjRbMn0e+7jepQU4Kxw6EEmm6+Zur1496/deLhjJA2Q8uhhOp10lvoqsva7rGbpJFm46dvz0fJWt8lObXmanJrqNEMkXBWJISbNZiyQyuoxqLnjqrDNSoi5HOf4zsutwEqcDufi9tPOL+XigU3qI2nRce+8HnjR+98dq7n/vfTZvUpnOGkmGVOZKZzKNHRgPq3qnAfAhC37oKK7kcFqpxWqih0kZjgah6xukB/5FIpp9Qd88bd37hh8l8LvLv6u6UcEkQMjg8OrLhwHBK3T0FMofJ1XazuncczS6HunUqYNL6vJENHo/HrzZdENz1lz88r3GvS4IQYMvhse/1ukP0/LYeCsfPyM1ZYf+gj370Ujft7XOvV5vKBpfMnHooHH5p/2j0S9G0Sd8zOk4LW6tIx7nHacHZO4Zc2GEo22jignr1psP0250jNBrK0IjH92o0kXgdl0w3urq6nD6fL6nuTuCS0RAgGI7/Ws85RjAp09Obj1Eao7wyZ/UGHcU5SdwSNtHWfDsdGLHQ84fZyW6L0AMvD9K3XtwvsvgjI35683CAs3iNIMigx7h+qaBpUTcm4XjIUSYoeA/qJNecbCGwy57NZVemxw8ujB3drNNocrTqF3uuk7S111RWmMluNdB4MEFtlgK11djJKOtoxBembXv7qCuZFqO+I5w81s1povbaCnrk+T3kj2FsTBktxgqVgwMDDwy43V/52AfMS9vqdCtGUtf3XXPdDZ1ms1nrdrtTa9euXbNu3boe9audFW677ZOa1at/NeUByrIihMmQ09mRh1PufXfH+vdQLhmhPPdsDBqSwUZRndPz7Z8eqNFwD9dotRz+aiidCnNnM5JOSlNbtZH6fTG6uquG3jrio8vbK2ndnmEKRNOUzUsk6/XqJxHFk0nqWLRow+VLltTq/au6qqsqqWb2X1Pb7PeqZxB5vV7au3dvX2tr6xNbt25N/eY3v3li8+bNI+rh04IJWcbVdiZlSs697DTkL+/4yPff8+5FXzDp8kxEnnp6h+josWGKxpMUiSXyqahe43I4xUyhKHwNfEMmm1GG7pmoUDRKZoOB2D8QTJyygG5ypx30eOg9N9xw9y233PIN9957zfbKDlp03bfVo6fH8PAwseYM6HS6tevXrx9YtWrVt7h5kuCZEDOTEVd3zxll5dSvWTH3Bw1Vli+Eg0HyeAM0Ph6kDCd6TjvnFtUOqqt2SCaznoZHgxzq6qnAQkb4msO8CW7AThymCKSIkWCYJj4uFtCdgHA8RhaLRLmEb8Wbr6717j+S0jVXHDaMj49RTfMKcX0RuJZJoMHBQUomk0Gr1eoOh8MJi8XiDwQC6QGGeqrA/v3dGXVzSigbDbl6adeDyxa0/1Nzo4s1ISmG4KEBGFAEsK4BixSMBj1tfruPpIyOoywWnJp5Y9AQRRCgklAsgqwToDfl6IpFbXyMyGjEei7u5PlBaqwapH2Dy6hlRhcNuYOFmvrW727bvr376aeffpwvO6/84mxRFhqydNGMj89prf1uW3MtsTnglgLJ7KQR1mq5GGU9mUwG0uu1ZDYZqaHeTjlNlryemDJly5KFlqBg0gq1IIOPnYhcIUsNjVbqnFlLJrNBTIbhc3BuJh2jhmo/a08LJSI+0mbD0va3Ny0ZGx0cb21r3DMw6D7zUMEFgM1mM6bT6WzJCbnyisuqG1y2VztnNstQWAgnlcqKeXL4BPReaEaGC7Sl2F7hMFOBSUln0xSNpvi6ArdzJ4bZAhFqjbGrvJQlpozaZ1TRovktZLMa2cHrmGyJHFaLOKfS2k/NtXHqHanh41aqqrRRhd2saax1LtYW8n9b43J0mQ3SEY8/5la/+gUFyEBdckJmNlU+v3hue6eOTRQ0Q9h/7uGwRJjKLZoiMa2L//gA5tBRVzgsVF1lJdkkkdmiJatNhuMnA+9Da6pcrFWyhjpnuWjunHoOlU1MLDt/JlmQnU6Lz4EsrMZeqnJmqW+sggwc0RlYK/G5VrOZGusrqam2cl4+kbrNyDHzqD+yh79sWvyAKeCtzW/LP37sUQ4dT0VJfciVizs/cu2Krv+prnSIVSfosXDEaeE3eF+jpWQqTf5ARPRY5LEgAlqDJB0kpViY8C+YusWsYSxnIJMmKe4D5wGfo5g01pKCMk2Me8CYZTJ5MptlSnHe0lCxidobs/TGnnbO8pvJwiYtxr4Ma8AwXB/0h+jDnQ1k4fs9v+0IuQPR76/Zdvj5AU/wt/gtZ4vm5ubW/37m2eDS5UtCatMklIyQD121uMVu1x9ZeFmbMFUQkMw+AvFQHgsdVEEcPDpE/mCMVl7RJXIPSBnhMAQNwSYSKeFn0OMRCIxHsuQw42dJ4jwDZ/HIY6AZIA3k4b6sY2waM2Ti+4D0GfWbqaWuQHuP1pI/2kFWi5GisRT7NGVJki2Tovd2NgmNKmJvv5vWbD30zCt7jn1qeDxyyjDIVFASk3XllZ2aQi6/dtHctlaZTUMRECx8CISOtVN9Qx7a1zO0vqW+eobDzj6Dj+SEX8HqEqzfzbEwU8KvoF30+lRSCBGCwzkwPRAoVq7g/tg3GGXRJvN5uw7050Y9/sLRfKvmgL+RxoI2anDYhIbAbyGQSHAOtLDGTk5uOxG1Tistm900N5cv3DXijzwTiiVP2+vPBSUZy9Hl6JaOlprlCGuTbC4SXJJsppLcY+NJrrmMef1MxsgmTuxeQm9NsqPPwvazkOBD4GcEA2qXxSYcu9hCxcBaL2GuuIhFdCIg4HvwZ8F/xFjQklaTeWP7ob/aOd5Bm91dtHvUyonoCOdBforHE4pmcd3Awj8dMPT/6fcuqrtuftv/qk3nhWnXkCWNDbqGlqoXZs9stBvYXCDsFMt+2ByZuQfmWWjo4Tu6j41GM8kbWFM+PHdW8xVYfwVtglAxGQUeoE0gCtdAW1DgU0SUxf4CZgzGEEKFX4LyCSL5YiyqQ0eIJtLpAz2D3zG3zr9To5dJjvnJf/RA6kDf6H94A2HfqDdoHx31+aosJmddhU1o1smAX2p2OWrZhA27g7EdavOUMO2EZPWFLqNRvqPOqLfWgpAs98BkisLhGAVDMTFE4mUn3js0/tm3th/d9K657d/oaGuo1TJJJs5B4KtBntViYj8is7iRs4BYPWl1MukNZu613HN5H2bPwOcIJ84kiVXzzBWuh0OH7/B4A9nFjVV/0ZdzSlqTlTqMCXrwxrm6Ld39qXVbD/+Rs8/9yGtD4//2xv6BwV29Y/N7xwI2zo80Ns6L4POKwELv/YPenYeGxzeoTVPCqXRPA+a11D71s7/76MfhUAFYGEw67e330Nef2biuotL6S43O+LPLF86ozsZi7s4ZDROOHCYLGqBX/QSemsINdHqNOAc/SM85BrQM+yYTwldFM1CDHOQg0VichoZ9NM9pog4Oax/d7qMAWWimKU1/e1Uz9XIe+OSG3Y+bZP1VbTXOmbMbq6m52iHWFsMURjiYgMa11iizkgPeED2+ftdX/uv1vQ+IhimiFIRU33vbSu+nr1uk7ioYDUTpm6s3+l7aedSlNtHKJR23LVvQ8YyrukL4AQtrCHwABAtzVyiwTwBBfAy9HtGY024SRMCB43EGnY5NF/sebAP4CxOJ5DPq9tKVM+uEEDobq9j0THapOPdsBATT2OsO0o9e3PbAb7cd+YraPCVMu1OvsBqvXdBWp+4dx+5jY7Rp/+AqdVeAM+ZW9Hb0bvgARFQIAuAn4mzakCfEuafCF6TY/Ch+AmuAFeGLkJWFDPOF8BfaYjbJXLOvkLXUVGUjD5MI8/Nadx8dG5s8OnI2ZOCzAtEkvbKnN9M94FmtNk8Z005IKJ7cPeibHB0iOprVUEXz22s/ozYJFHI5S6UTIahRmCsL+w0I1WTUiQDAxOErzB6G2BEcmJz1fBWmbNURYBZWljUIREEjlMLEcTSHGcRj3Kthcrzsuxqr7OTgaO5ExPm8k8fDioDGcphL+wa8MG2jz2w6ePWAJ7RPPTxlTDsh/DsOv97dN+kxY2TcmGx6d1dLh9okYLWb52BZrxLOcs2OE/KBH0DvFWNVIvNGpMM/JekTPR+jwHomSNEKaASTxzXCZ5BqZoJl9jkRNWKDQz46GiDDCU46wVr4y9f20D72awfZ1/SM+LEoQmjSUxv30XfXvJX52au7f/7PT778xUdf2tEwOh7awtHcecvzbLTygmNGXcUDT95z65fZfKktRL5wnM2Wm+55bO3n09n8f6Lt9pve3Tenva4Vj6vlsoimlOcIBYHsI8RMIgP+QTZoKRxJsA8xi334EGgOPAHMGHo07oMfDDMWicZFyNzbM0B2ScrdtGy2FlqCsHaUo7zHX96165lN++/Ta7U1ZoPWYuWM0hOO+1lroAXbuSCDveAoSaaeyeaDc1tcn2di1Bb0cGQMEr20o6eXf/QLy6+YbXaY5G/WVHM4inCVAUEilIU2YBtmCdqRZ+eOviXGuJgIaFQeXEnIQZDZY8RYSSaRx4CgWCIt8ha3P0K+gnT7oYGh24bDIXrjYD89+F8b/2rLoaG7+D6HM7nczngquzUYT21mTdrFd8UU7unt2AXAtJssIJpM72Jz8LZ4akqFgZ03BgfnNFX/GfaNZgOnGkYNhjpk9hOcu4jICk4eNfILDGtgnhwjxTqDlUxmO5s+xWRBFUBa0aSBU/R+mDscxGwjgG9gNui0ZvZNFQ4jOR0G4uTu++JgCVASQoBdx9z37eodVfcUwAy111Y4sT0y6M9ZLAbhmItRk+JL1MJagX3ssSKw2iX4x2Q4H2FCQBDfy8BkiSIjqlKIRCCgjAxw9MXkQtvsZsOY8jmgCoSVDiUjhM3Siz/fsGdQlbUAkr0KmwkSMUaj8c/ZLBhQRJaNkV/+qujdXAvTxe14Whf+BL4hywQJzWAoWgDalP8UEhVCIfji+BY+G/ueaPaQQjrftbR8lI4QYNOB/s9u6xlW99h0sHmC2br7xuXeT14550HY/CwngpivgB9IJVMctiqDjwhfU+m0cMzIS8KRuIi64Cvg+MXYFieIGLPCPAgIRP8XBGNL0qo1FjtEZvKlCmvivNKhpIREEpkXf7Ju517RORkWo56uXziDPveBJdZKjpbsNrMIXRFdIf8QZocLxrBQMP8O8wNfYqtqFn4C4saPgotQhuUxustOXRDJhDKJqaSSj6CAPM5lLEymUJLz1ZDDz379vGRaUkKAHb1jX3hhxxGxDXveWiNcCC2eUUcjw15O6hAhKXPsIkJCYfMkBKfWWi6JsEeYPGTnyMyxDTJBnIGJNooik9mIxRI4D0TiDQKI0nKjCh3nj86b/+W8wuGSExKOJ998fP3uNUjETkQ7E/OZZbNolixRbS5LjmiMzVIMLkRESzAw8AmCJJZlPpsW2xi3ynLMq5g7mC7eZy0R5/I+Ql6Mh2FKFyG00WiISPnUQb6d8n+JUXJCgAND3jW9Y5Mf0xjh/ACJooF9ip17eprNiz8QFX4B8xtYgSKErIav8NAIcaFlorCDRw1Hj4gKBQEACgiE6KFpyWTiwHPrDiS5CSuKSuxByoQQtuOPdvd71D0FMXbkLoeZrGxmEMLiKanqKocwRzoOZbGIQazhYoedL3AyKMlqEpgTTh9DImIGMoEBSQxMKoOSysDkcW0KRZMJ/jgO2wqnXQUy3SgLQoBfbti7CosGADwriIE+l93Cjj9NnQ1V1B9LizwC068wQRh6Z06458MRS2x6jOI4CgYeMSBpNnHN98FYFsav0I7AgLNvQSyGWFjD+vkjWddEFFxyFSm1hk5CndPyyY+u6HpkxZzmGvRwzFcjCnp6036ysrYIjeBvLFafwMawGEXYygLGgeJwO85DO8wTBgxBBmYboWkIe32BsJhbCbNf2rLn6Hd2dfd/8RPvmxtZ2FFjRRj91Z9sLJlcyoqQE/CBGoflikq76f1L5zStzLAY4QvgyxF1IcMWjpz9B3yFcOBcTBxBiRFhvkEx8YNpi7P5U8gEiZhuLYh3Z3G7X6+T3//a2we2f+L6y8ILZtXYUqlcSQkpG5N1El7whGJfGx6PtKQ5YkJ+AeGjIDoV/6EWpejUlaireIz/cCMTxteaOY+xGLSk43PxiiYpk6aevlGqqTctBRnicuXGJe+h5UqIgMWkb1YiJCVSUoZKju8rbVxU86SYLPUYzhPnqueg8HWoi6sanbItrH4UnMh55Q8XCheNEP+xPTPUzSnBbieZIywJHV30fBRVI5RabRfbXPiaiX1It9iuFuUeyrVgA38zac1EZMXt4kipcdEIce94rlPdnBIiEelqq1gpqApUCFXxC0LgvA3gmBAkarUcz02U42ITRLJBKp4D05STsxMzZGhWN0uKi0ZI1633vaBuTglshuZgbEsZMlGf91B7ODJxbIssXZCjRFzKuco5aMMb45Rz1PYTruFTyJAtTLzqgY+KtaiwZoxm8bcEuGiEnC/Y9jsrbGbScxKoJIM6MfaEMSjMcaAd+5imxeAi5uTxnl7Mh2DSCr4D0Riuhc8R9+BrkYeghs8pOMw29eOgdUJJxDA/UatoLAHKlhAWlw45hNAM0btZXFww3IEcJV/UEi7haJJ293nD63f0PrL+7Z79WP1Y1JKiVp2oOYqGFCgezk0844FDioaIOKtGNJYAZUuI2aAkd/AdEHox1+BNIWSYKAgWC6a7B8f3uVzVy3z+yN2hROqmw4O+CRKwDKhotnA+7oNjIHX1mo1e9ePwOcLxqISc+SUpFxllSwi73ZuwdhbyKYatMD3YLw4iIlHs7vcVamsq73j9rW7xb4PEYqmenmH/ERAJ4YrHEMT1ytw6SEaB2brxxndNOHUmKwuvjhDaYTG+Q8jJMMq6hSABGoEeDYoA9HJ1k0Z9YRodj/7zprcPblNaFKSzuV+E2IwVTZOwRQxsgwzcAIRFIiE1HJusIWaTbvKKuWlEuRJitpiU18OJJE9N7tBQ1BaWLh1zh/JaneZfcd6JYBP1WjSB4RJlwYOiIaqG4T5QM77bq6/2HPchnJaAdxAm67RY0HXOePhrf6J5+Kt/el4yLVdCPmLnHAS2H0VMOmXZFwg/wH4hmyVfKEYZkn4SCsVO9/DlhkRKGRXGNC38RvEeefihHJszrVbVMwWsTeKdT+BKq4Za54wCWb50/5MTWjcVlCUhbMdnVNhMEAz3ZiyaxiPMSqiKgn1PME43Xr/4jEv/8UQW/Icsy0IrcA32ESoLq0WEeZAJMCExSFT4l+LKvHPEl+7/RUTdnDLKkhCjQW+osLEZZ7FIBchG8QVFoMd7QrHYD3/+8vElKycBD+TADkGjFBy/B3yLpJXeEjsq2IdEcRSFTdaUCLkQKEtCrCa5vvjmHsXew7aLv1xrKISnY2XDr8SBM6CY/ClOXAF8CVapQOgcLhxWWhUwSWFxgEnDAolSoSwJYYHcBTmKCEnNHya2ORjyBWPk9QbOuNyTr73L5TQr1/E1x++DpFKZ5h0ZC4+ppwvwx8UU/cETWNOz5Pk//u3OU+RfdoRYzeYrnVYj+vZE7y5qh4iuGHileCyRPu3DlWz+l7fXV/yoodouersYamfgXgh1QYZYnK2RJs2h8+EJ+z9dFmuAE9iTUXaExBOJa/GaV2UpjzI0cjzT5sLbkVjytJEMi/GqukrrxiVzGoVElcFFZYgF2pJI4uUBeRobj5LdZtktLpqANOFDiktSLzasFuPl6uYEyo4QrVay1bsc7FjVgUMUMaiobMM3cI5xypt5uFe/v72+8rVrFs/UGTmygkbg/OLgIjSFOSG8AWjQF3nF7Q38j3qpABu3ODQKwNz7xcb999664L6vPSVmK09E2RFSYTXVQDDiAX/OG4r5A2q0YWkP+5DN6ukCLMB7ZzVVvbh8frMEswQ/Ica+cA9xvTIAibVcuw4PZ60WwxfVSycALgQd/AfBwMWG02npUzcnoewIYQ34hHgmRBSdWP6JbSzvgabg8bNCIT/RszgA+OnSy5oeuryzUQzLT2gWb4tnSPha5d+o0tCQL4IHNG8e84RO8T/Cr6iYYhpyTrjn3p9NTB+fiLIjxGLUm4uagaI8sKm8UgmaEogk2A+QyKotRvnHKxe03dFa6xTn4TqhFdAQJgHXRfh8aNWRAS/1Dvs/x079tK/AYJcltANaAvJKhbIihO3+7RaTLASCiEqMO7EvOL6P1zHl6IrLZ/Xy9sOLZtXd2VTjEOcgX4EzRjaOEVv0cQzRQzvcgSje6/tkOpv7kfJJpwIEsh8R29opjpxcCJQVISzTDqfFICIi5A7qAKyAeOElt6MjDw37sh2Nlf/YzGQo5yldG9FUcR8Cxr+UMOwJ0lgouaa33yMelTsTcIsiNNMTZJ0WZUUIO+RKjGGJHs5dHFm50tcZahsmlkKh6D/AZ2AMEMeFhigX4ERxOgYXfaE49boja4fH/L/3X88RGgJSuEyHUz8TyooQm0megwdyFChCKZoRIWtuS2VyyaYa+3IMgYiHC1XZwWQp54CMrMjmB8cjb/iDkQ8qrb8bx1+9UWCT9Q4hAiaj3IKejtBVmB5BhiIcaMaAO0T+cEqDfCKagF/Hsh5xWNgcmCysbveyz+jzRHeMukNXqUd/L3L8gcVb8bZN3Zx2lBUhHMLOBBlwwn2jQTo2EqAhb4gC4QRt2u+mHk+SZJNFjuVk2nTQR9uOeMX73gUEkURBjqp6RoO7ls+ed9ZkADmEWSol+VyhWmyUAGVDCGfT9yeyWnlDt5v29Iepz5+hvvEMk5CiLYc8lD3pHQfI3KNpogMjMdrOxOCxt3AsSbuPjh1M5/N//OuNG8/pdd8cLQt9RMkV8sffaDDNKAtCDAbD69XV1V8xGE1MjE6EuEXgVXwG45mnuOH4I0zMW4e8tP/YGI2H4/eMj4fFgodzATt1RT34L7smu9guAUpOCAv/bxwOx1UYbzoZsOoTEdTvAM7LFjTkDad9uVx+rdp8ToCPKjoRjrL+cFedmEymB2F+TgdoB4ZAzgbKFK0etr9NaTk3MCGCDvzRazV/uBrCAv+dEc3v0w6geI5K3kqxc47gCG0iztJqNRaxUQKUnJDTmSoAwikK6GyBcSzGlP6RYWX4K48Pxujx5Bf0TiNKTogQwmmAXo8VI6lUqijo3ws2cb1cTZorP1tkcvk0rBa6APuQkg2elJwQFvgZ/7UBRFscgYlt+BOUM0FZe5V5TN09Z6TT2Vgx0OLP/cMlJJlM3hoKhQYg7KKZOrEUNQh1LBYbDwQCD0ej0QIIwHEAdSQS2cr3+J5omAKiifSz3mAih3cxjgcTL6rN046LOmjz2BO/0t356U/+TntzxzWk8QWlttd6bfMS8XgHmyrRSVjIQtpcgZEQE/Am14fQxrBzVPXnbNJEAsdk5ZmMR7ma/AKuE3DTR29713O/WT1pypQ1Sr7p5o+7ju18fvTAcDq//LKKeqtZvrzJ6n7l8Q10QV6u/w7ewTt4B/9vQfR/q9V/Nv8z/AAAAAAASUVORK5CYII="></div>
                <div class="center mt-2">Harvest</div>
            </itembox>
        `);
    }

    
	function quickHarvest() {
		for (let i = 1; i <= 5; i++) {
			let status = IdlePixelPlus.getVarOrDefault("farm_stage_" + i, 0, "int");
			if (status == 4) {
				IdlePixelPlus.sendMessage("CLICKS_PLOT=" + i);
			}
		}
	}

    function quickPlant(seed, alt) {
        let n = IdlePixelPlus.getVarOrDefault(seed, 0, "int");
        singleOverride =
            IdlePixelPlus.plugins.slapchop.getConfig("autoSingleEnabled");
        if (alt || singleOverride) {
            n--;
        }
        if (!alt && !singleOverride && n > 1) {
            n = 1;
        }
        const donor = DonorShop.has_donor_active(
            Items.getItem("donor_farm_patches_timestamp")
        );
        const maxPlot = donor ? 5 : 3;
        for (let plot = 1; plot <= maxPlot && n > 0; plot++) {
            if (IdlePixelPlus.getVar(`farm_${plot}`) == "none") {
                IdlePixelPlus.sendMessage(`PLANT=${seed}~${plot}`);
                n--;
            }
        }
    }

    function initQuickPlant() {
        PLANTABLES.forEach((item) => {
            $(`itembox[data-item="${item}"]`).on("contextmenu", (event) => {
                if (
                    IdlePixelPlus.plugins.slapchop.getConfig(
                        "quickPlantRightClickEnabled"
                    )
                ) {
                    const primary = window.isPrimaryActionSlapchop(event);
                    const alt = window.isAltActionSlapchop(event);
                    if (primary || alt) {
                        if (
                            IdlePixelPlus.plugins.slapchop.getConfig(
                                "quickPlantHarvestRightClickEnabled"
                            )
                        ) {
                            window.quickHarvest();
                        }
                        window.quickPlant(item, !primary);
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    }
                }
                return true;
            });
        });
    }

	window.initQuickGather = initQuickGather;
	window.quickGather = quickGather;
    window.LOOT_BAGS = LOOT_BAGS;
})();
