sdk_translatePage();

function addPlanElement(plan) {
    const planElement = document.createElement('div');
    planElement.innerHTML = `
                    <div class="plan" data-plan="${plan.price_id}">
                        <div class="plan-left">
                            <div class="duration">
                                 <span data-i18n="nbsdk_month${plan.months}"></span>
${plan.months === '1' ? '<span class="tag new-user" data-i18n="nbsdk_a10"></span>' : ''}
${plan.months === '3' ? '<span class="tag discount" data-i18n="nbsdk_a11"></span>' : ''}
${plan.months === '12' ? '<span class="tag popular" data-i18n="nbsdk_a12"></span>' : ''}
                            </div>
                            <div class="price">
                                <span class="current">$ ${plan.dis_price}</span>
                            <span class="original">$ ${plan.ori_price}</span>
                            </div>
                        </div>
                        <div class="select-indicator">
                            <svg class="checkmark" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                        </div>
                    </div>`;
    return planElement;
}

const plansContainer = document.querySelector('.plans');
fetch(sdk_api() + `/NbSdk/plans/${sdk_appid()}`)
    .then(response => response.json())
    .then(data => data.data)
    .then(items => {
        items.forEach(item => plansContainer.appendChild(addPlanElement(item)));
        let selectedPlan;
        const plans = document.querySelectorAll('.plan');
        plans.forEach(plan => {
            plan.addEventListener('click', function () {
                plans.forEach(p => p.classList.remove('selected'));
                this.classList.add('selected');
                selectedPlan = this.dataset.plan;
            });
        });
        selectedPlan = plans[0].dataset.plan;
		var langt = chrome.i18n.getUILanguage();
        plans[0].classList.add('selected');
        document.getElementById('payButton').addEventListener('click', function () {
            chrome.storage.local.get('userInfo', e => {
                window.location.href = sdk_api() + `/NbSdk/createSubscriberPay?appid=${e.userInfo.appid}&mail=${e.userInfo.mail}&price_id=${selectedPlan}&lang=${langt}`;
            });
        });
        sdk_translatePage();
    })
    .catch(error => console.error('Error adding plans:', error));

alert(sdk_i18n('nbsdk_a15'));