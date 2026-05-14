/**
 * Depo Claim Center — Vue 3 app + scroll reveal
 *
 * Eligibility checker uses the exact 4 qualifying criteria:
 *  1. Used Depo-Provera between 1992–2019
 *  2. Used it for at least 1 year (4+ shots)
 *  3. Diagnosed with a meningioma (brain tumor)
 *  4. Not currently represented by another law firm
 */

(function () {
  'use strict';

  // ── Scroll reveal ──────────────────────────────────
  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  // ── Stat counters ──────────────────────────────────
  function initStatCounters() {
    var els = document.querySelectorAll('.stat-counter');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animateCounter(entry.target);
      });
    }, { threshold: 0.5 });

    els.forEach(function (el) { observer.observe(el); });
  }

  function animateCounter(el) {
    var target   = parseInt(el.dataset.target, 10);
    var suffix   = el.dataset.suffix || '';
    var duration = 1600;
    var start    = Date.now();
    // Start close to target for year-style numbers (e.g. 2023 counts from 1980)
    var from     = target > 999 ? target - 43 : 0;

    function tick() {
      var elapsed  = Date.now() - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 3);
      var current  = Math.round(from + (target - from) * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // ── Eligibility checker (Vue) ──────────────────────
  function mountEligibilityApp() {
    var el = document.getElementById('eligibility-app');
    if (!el || typeof Vue === 'undefined') return;

    // Exact 4 qualifying criteria per campaign strategy
    var steps = [
      {
        question: 'Did you receive Depo-Provera (or a generic birth control shot) between 1992 and 2019?',
        hint: 'This includes any clinic or doctor, including Planned Parenthood.',
        options: [
          { label: 'Yes, I got the shot between 1992–2019', qualify: true  },
          { label: 'No — I got it before 1992 or after 2019', qualify: false },
          { label: "I'm not sure of the exact years", qualify: 'maybe' }
        ]
      },
      {
        question: 'Did you use the Depo shot for at least 1 year?',
        hint: 'That means you got 4 or more shots total.',
        options: [
          { label: 'Yes, I used it for 1 year or more',     qualify: true  },
          { label: 'No, I used it for less than 1 year',    qualify: false },
          { label: "I'm not sure how long I used it",       qualify: 'maybe' }
        ]
      },
      {
        question: 'Were you diagnosed with a meningioma (brain tumor)?',
        hint: 'A confirmed diagnosis from a doctor, MRI, or CT scan counts — surgery is not required.',
        options: [
          { label: 'Yes, I have a confirmed diagnosis',          qualify: true  },
          { label: 'I have symptoms but no diagnosis yet',       qualify: 'maybe' },
          { label: 'No diagnosis',                               qualify: false  }
        ]
      },
      {
        question: 'Are you currently working with a lawyer on a Depo-Provera case?',
        hint: 'If you already have a lawyer, we cannot take your case.',
        options: [
          { label: 'No, I do not have a lawyer',              qualify: true  },
          { label: 'Yes, I already have a lawyer',            qualify: false }
        ]
      }
    ];

    var { createApp, ref, computed } = Vue;

    createApp({
      template: `
        <div class="eligibility-widget">
          <div class="elig-card">

            <div v-if="step < steps.length">
              <div class="elig-step-indicator" role="progressbar"
                   :aria-valuenow="step + 1" :aria-valuemax="steps.length">
                <div v-for="(s, i) in steps" :key="i" class="elig-step-dot"
                     :class="{ active: i === step, done: i < step }"></div>
              </div>

              <transition name="elig-fade" mode="out-in">
                <div :key="step">
                  <p class="elig-question">{{ currentStep.question }}</p>
                  <p v-if="currentStep.hint" class="elig-hint">{{ currentStep.hint }}</p>
                  <div class="elig-options" role="group">
                    <button
                      v-for="(opt, oi) in currentStep.options"
                      :key="oi"
                      class="elig-option"
                      :class="{ selected: answers[step] === oi }"
                      @click="choose(opt, oi)"
                      :aria-pressed="answers[step] === oi"
                    >
                      <svg class="elig-option-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
                        <circle v-if="answers[step] === oi" cx="10" cy="10" r="4" fill="currentColor"/>
                      </svg>
                      {{ opt.label }}
                    </button>
                  </div>
                </div>
              </transition>
            </div>

            <div v-else class="elig-result">
              <div class="elig-result-icon"
                :class="{
                  'elig-result-icon--qualify': qualification === 'qualify',
                  'elig-result-icon--maybe':   qualification === 'maybe',
                  'elig-result-icon--no':      qualification === 'no'
                }" aria-hidden="true">
                <svg v-if="qualification === 'qualify'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <svg v-else-if="qualification === 'maybe'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>

              <transition name="elig-fade" appear>
                <div>
                  <p class="elig-result-title">{{ resultContent.title }}</p>
                  <p class="elig-result-body">{{ resultContent.body }}</p>
                  <a v-if="qualification !== 'no'" href="#form"
                     class="elig-result-cta" @click.prevent="scrollToForm">
                    <svg style="width:18px;height:18px" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd"/>
                    </svg>
                    Get My Free Case Review
                  </a>
                  <button class="elig-restart" @click="restart">Start over</button>
                </div>
              </transition>
            </div>

          </div>
        </div>
      `,
      setup() {
        var step    = ref(0);
        var answers = ref({});   // step index → option index chosen
        var qualify = ref([]);   // step index → qualify value of chosen option

        var currentStep = computed(() => steps[step.value]);

        var qualification = computed(() => {
          if (qualify.value.includes(false)) return 'no';
          if (qualify.value.includes('maybe')) return 'maybe';
          return 'qualify';
        });

        var resultContent = computed(() => {
          if (qualification.value === 'qualify') {
            return {
              title: 'Good News — You May Qualify!',
              body: 'Based on your answers, you may have a valid Depo-Provera claim. Fill out the short form below for a free case review. There is no cost and no obligation.'
            };
          }
          if (qualification.value === 'maybe') {
            return {
              title: 'You May Still Qualify',
              body: "We're not sure based on your answers, but it's worth a closer look. Fill out the form and a lawyer will review your specific situation for free."
            };
          }
          return {
            title: 'You May Not Qualify',
            body: "Based on your answers, you may not meet the current requirements for this claim. However, every case is different — we encourage you to speak with a lawyer to be sure."
          };
        });

        function choose(opt, oi) {
          answers.value[step.value] = oi;
          qualify.value[step.value] = opt.qualify;
          setTimeout(function () { step.value++; }, 260);
        }

        function scrollToForm() {
          var form = document.getElementById('form');
          if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function restart() {
          step.value    = 0;
          answers.value = {};
          qualify.value = [];
        }

        return { step, answers, steps, currentStep, qualification, resultContent, choose, scrollToForm, restart };
      }
    }).mount('#eligibility-app');
  }

  // ── FAQ accordion (Vue) ───────────────────────────
  function mountFaqApp() {
    var el = document.getElementById('faq-app');
    if (!el || typeof Vue === 'undefined') return;

    var faqs;
    try { faqs = JSON.parse(el.dataset.faqs); } catch (e) { return; }

    var { createApp, ref } = Vue;

    createApp({
      template: `
        <div class="faq-list" role="list">
          <div v-for="(faq, i) in faqs" :key="i"
               class="faq-item" :class="{ 'is-open': openIndex === i }" role="listitem">
            <button class="faq-trigger"
                    :aria-expanded="openIndex === i"
                    :aria-controls="'faq-answer-' + i"
                    @click="toggle(i)">
              <span>{{ faq.question }}</span>
              <svg class="faq-trigger-icon" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
            <transition name="faq-slide">
              <div v-if="openIndex === i" :id="'faq-answer-' + i" class="faq-answer">
                {{ faq.answer }}
              </div>
            </transition>
          </div>
        </div>
      `,
      setup() {
        var openIndex = ref(null);
        function toggle(i) { openIndex.value = openIndex.value === i ? null : i; }
        return { faqs, openIndex, toggle };
      }
    }).mount('#faq-app');
  }

  // ── Init ──────────────────────────────────────────
  function init() {
    initScrollReveal();
    initStatCounters();
    mountEligibilityApp();
    mountFaqApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
