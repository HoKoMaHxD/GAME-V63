# التحقق من 2.5.56 — مهمة الرومات العامة

- فحص JavaScript: `npm run check` ناجح.
- 164 اختبارًا موجّهًا ناجحًا: 91 اختبارًا قائمًا للمهام اليومية والصوت والواجهات والأوامر واستعادة العضوية، و69 للعرض والدبل وتحكم التشغيل والريست والمهمة الجديدة، و4 لفحص عرض أوقات الأوامر دون كتابة.
- تتضمن المجموعة 22 اختبارًا جديدًا في `test/public-voice-task.test.js`، تشمل المهمة السابعة دون إزاحة المهام الأخرى، الدقائق المتجمعة، الحدود الدقيقة، الكاتقوريات الثلاث، منع احتساب سيرفر آخر، غياب دليل الكاتقوري، إعادة التشغيل، تكرار الفترات، فقد تأكيد صرف المكافأة، عدم تكرار التنبيه، وتجديد منتصف الليل.
- نجح التحقق من الرومات الجديدة ونقل الروم، وحفظ كاتقوري كل فترة وقت رصدها، واستثناء وقت الانقطاع، والحفاظ على إعدادات أهلية الصوت.
- اختبار أساس قبل التعديل: 30 ناجحًا وحالة فاشلة قديمة في `command-times.test.js` تخص بدء نهب برصيد صفر. هذه الحالة لا تخص المهمة الجديدة ولم تُعدل؛ جرى التحقق من حالات العرض ذات الصلة مباشرة. لم يُشغّل الفحص الكامل غير المرتبط بالتعديل.
- السجلات: `docs/review-logs/v2.5.56/`. ملف `existing-tests.txt` يغطي 91 حالة، و`feature-tests.txt` يغطي 69، و`command-time-tests.txt` يغطي 4، و`baseline-tests.txt` يسجل فحص الأساس.
- اختبارات محلية على Node `v24.19.0` بمحاكاة Discord وقاعدة البيانات، دون نشر أو اتصال ببيئة الإنتاج.
- [تفاصيل المهمة والتثبيت](docs/PUBLIC-VOICE-v2.5.56.md).

# التحقق من 2.5.55 — تحميل الأعضاء والاستعادة

- `npm run check`: ناجح.
- 113 اختبارًا موجّهًا ناجحًا دون فشل، منها 20 اختبارًا جديدًا للصفحات والاستعادة وكتابة حالة الألعاب.
- شملت الاختبارات العضوية والصوت وتتبع الألعاب وتحكم البنك والريست الشامل. اختبارات الأساس للعضوية والألعاب وإعادة حفظ الصوت: 55 ناجحة قبل التعديل.
- أمر التحقق: `node --test --test-timeout=20000 test/membership.test.js test/membership-recovery.test.js test/games-recovery.test.js test/games.test.js test/voice-retry.test.js test/voice-channels.test.js test/voice-attendance-private.test.js test/runtime-control.test.js test/full-reset.test.js`.
- Node المستخدم: `v24.19.0`. اختبارات محلية بمحاكاة Discord وقاعدة البيانات؛ لم يُجر تشغيل حي على Render أو اتصال بقاعدة الإنتاج، ولم يُشغّل الفحص الكامل.
- [تفاصيل الإصلاح](docs/RECONNECT-v2.5.55.md)، وسجلات الفحص في `docs/review-logs/v2.5.55/`.

# التحقق من 2.5.54 — أزرار الألوان

- `npm run check`: ناجح.
- `npm run test:games`: 239 اختبارًا ناجحًا، منها 8 اختبارات جديدة للألوان.
- `node --test test/bank-menu.test.js test/commands.test.js test/full-reset.test.js test/runtime-control.test.js`: 29 اختبارًا ناجحًا.
- الإجمالي: 268 اختبارًا ناجحًا دون فشل. لم يُنفّذ الفحص الكامل غير المرتبط بالتعديل.
- شمل التحقق آخر لونين، الضغط المكرر، تأخر تأكيد الاستلام، فشل عرض النتيجة وإصلاحها، عدم تكرار المكافأة، وصاحب الجولة والرسالة الأصلية.
- اختبارات محلية بمحاكاة Discord وقاعدة البيانات؛ لم يُجر تشغيل حي أو اتصال بقاعدة الإنتاج.
- [تفاصيل الإصلاح](docs/COLORS-v2.5.54.md)، وسجلات الفحص في `docs/review-logs/v2.5.54/`.

# التحقق من 2.5.50 — أمر إعدادات خصم السبام

- `npm run check`: ناجح.
- **109 اختبارات موجّهة ناجحة**، دون فشل، تشمل **15 حالة جديدة** في `test/spam-settings.test.js`.
- يشمل التحقق تسجيل `/خصم` وترتيب خياراته، الرد الخاص، صلاحيات الإدارة ورتبة التحكم، منع الأمر من السيرفرات الأخرى والخاص، عرض الإعدادات دون تعديل، تغيير خيار واحد أو كليهما، وحدود القيم.
- اختُبر حفظ الإعدادات بعد إعادة التشغيل، تزامن التعديلات، الطلبات القديمة والمكررة، فقد تأكيد حفظ الإعداد، وفقد قفل التشغيل.
- اختُبر تطبيق المدة والمبلغ الجديدين على الرصد الفعلي، الحد الزمني الدقيق، وتثبيت سياسة المخالفة المحفوظة عند الاستعادة حتى بعد تغيير الإعدادات.
- اختُبرت المخالفات القديمة بلا سياسة محفوظة على الافتراضي السابق 3 ثوانٍ / 500، وبقاء الرصيد عند صفر عندما تتجاوز العقوبة المخصصة الرصيد المتاح.
- أمر الاختبار: `node --test --test-isolation=none --test-timeout=20000 test/spam-settings.test.js test/nonnegative-balance.test.js test/sheikh-spam.test.js test/commands.test.js test/permissions.test.js test/runtime-control.test.js test/financial-log.test.js test/bank-commands.test.js`.
- السجلات: `docs/review-logs/v2.5.50/`.
- الاختبارات محلية بمحاكاة قاعدة البيانات وتفاعلات Discord؛ لم يُنشر البوت أو يُجر اتصال بقاعدة الإنتاج، ولم يُعد تشغيل الفحص الكامل.

# التحقق من 2.5.49 — منع الرصيد السالب

- فحص بناء JavaScript: `npm run check` ناجح.
- 101 اختبارًا موجّهًا ناجحًا، دون فشل؛ منها 22 حالة جديدة في `test/nonnegative-balance.test.js`.
- شملت الاختبارات: رصيد صفر، أقل من 500، 500 بالضبط، أكثر من 500، الرصيد المختلط، خصومات متزامنة، مشتريات متزامنة، حجز التحديات، منتصف الليل، إعادة التشغيل، وفقد تأكيد الحفظ.
- تصحيح الأرصدة القديمة يعتمد على مجموع جميع أيام العضو ويحافظ على الرصيد الموجب والتقدم والحضور. جرى اختبار توقف التصحيح قبل الحفظ وبعده وعدم تكرار الإضافة.
- التنبيه والسجل المالي يعرضان مبلغ الخصم الفعلي؛ المخالفة عند صفر تبقى مسجلة دون دين على المكافآت المستقبلية.
- الأوامر الإدارية والمشتريات تبقى ترفض الطلب إذا كان الرصيد غير كافٍ.
- الاختبارات محلية بمحاكاة قاعدة البيانات وDiscord. لم يُجر اتصال بقاعدة الإنتاج أو تشغيل فعلي على Discord، ولم يُعد تشغيل الفحص الكامل في هذا التحديث.
- أمر التحقق: `node --test --test-isolation=none --test-timeout=20000 test/nonnegative-balance.test.js test/sheikh-spam.test.js test/financial-log.test.js test/reset.test.js test/shop.test.js test/mini-games.test.js test/positive-balance.test.js`.
- سجل الاختبارات: `docs/review-logs/v2.5.49/targeted-tests.txt`.

# التحقق من 2.5.48 — مربعات

- `npm run check`: ناجح.
- `npm run test:games`: 203 اختبارات ناجحة، دون فشل.
- اختبارات مربعات الجديدة: 29 حالة، إضافة إلى حالتين في اختبارات تفاعلات الألعاب المشتركة.
- الفحص الكامل: 971 ناجحة من 978؛ السبع الفاشلة مطابقة بالاسم والسبب للنسخة الأصلية (940 ناجحة من 947)، وتخص النهب.
- التحقق يشمل ملكية الضلع الرابع، إكمال مربعين بخط واحد، الدور الإضافي، إكمال جميع الخطوط، فوز صاحب النقاط الأعلى حتى لو رسم خصمه آخر خط، حجز الرصيد وصرفه مرة واحدة، الحماية من الضغطات المتزامنة والقديمة، انتهاء المهلة، واسترداد العمليات المحفوظة بعد انقطاع.
- راجعت صورة اللوحة الفارغة واللوحة أثناء اللعب؛ 24 زرًا في خمسة صفوف، والحد الأقصى خمسة أزرار في الصف.
- الاختبارات محلية بمحاكاة Discord وقاعدة البيانات؛ لم يُنفّذ نشر أو اختبار على Discord أو MongoDB الإنتاجية.
- نُفّذ الفحص الكامل بالأمر `node --test --test-timeout=20000 test/*.test.js` على Node 24.19.0.
- السجلات: `docs/review-logs/v2.5.48/`.

# التحقق من 2.5.47

- `npm run check`: ناجح.
- `npm run test:games`: 172 ناجحة، دون فشل.
- `npm test`: 940 ناجحة من 947؛ السبع الفاشلة مطابقة للنسخة الأصلية.
- 17 من حالات محاكاة التعليق فشلت في الأصل ونجحت بعد الإصلاح.
- أُجري الفحص بمحاكاة Discord وقاعدة بيانات تجريبية، دون نشر فعلي.
- [شرح الإصلاح والتثبيت](docs/BUTTONS-v2.5.47.md).

# Verification — v2.5.25

832 automated local tests passed on Node 24.19.0. Application entrypoint syntax checked.

Task boost tests cover exact start/end boundaries, multiplier validation and overflow, overlapping/concurrent event rejection, idempotent event creation, write acknowledgement recovery, actual daily message/voice/game rewards, unchanged past completions, independent attendance, duplicate receipts, restart persistence, administrator authorization, selected-channel/image/role announcement, lost-bind recovery without duplicate announcement, and expiry edits without renewed role pings.

No live Discord or production MongoDB test was performed.


## v2.5.26
Announcement command: 6 command tests passed; local mocked publication, private acknowledgment, unauthorized access and invalid image checks passed. New module syntax checked. No live Discord test.


## v2.5.27
Announcement mentions the same role as task boost (1516418133131268187), with explicit allowedMentions and role mention permission validation. Syntax and existing command tests passed locally; no live Discord test.


## v2.5.28
See docs/FINANCIAL-LOG-v2.5.28.md for scope, delivery guarantees and local validation.


## v2.5.29
Live bank pages: 38 view/XO tests and 13 button-game tests passed locally. App syntax checked. No live Discord validation.


## v2.5.30
See docs/REVIEW-v2.5.30.md. Full suite: 848 passed; one additional full-reset regression passed subsequently (849 unique cases total). Local MongoDB integration startup failed in this environment; no production test.


## v2.5.31
Escalating robbery spam block: 6 local tests passed and module syntax verified.


## v2.5.32
Positive-balance guards: 91 targeted tests passed locally; modified modules syntax checked. No live Discord test.


## v2.5.33
Embed-only financial logs: 13 local tests passed. No live Discord render validation.


## v2.5.34
Voice tracker retry isolation: 80 targeted local tests passed; syntax verified. No live Discord/MongoDB deployment validation.


## v2.5.35
Random numbers endpoint 15–25: 21 tests passed; display module syntax checked.


## v2.5.37
Infinite XO: 38 local tests passed; syntax checked. Rules source and compatibility details in docs/INFINITE-XO-v2.5.37.md.
