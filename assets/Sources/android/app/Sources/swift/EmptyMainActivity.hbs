import Droid

final class MainActivity: AppCompatActivity {
    override class var exported: Bool? { true }
    override class var theme: Style? { .appCompatNoActionBar }
    override class var intentFilters: [IntentFilter] { [.mainLauncher] }
    
    override func buildUI() {
        enableEdgeToEdge()
        body {
            ConstraintLayout {
                TextView("Hello World!")
                    .width(.wrapContent)
                    .height(.wrapContent)
                    .startToStart()
                    .bottomToBottom()
                    .endToEnd()
                    .topToTop()
            }
            .onApplyWindowInsetsCompat { event in
                guard
                    let systemBars = event.insets.insets(WindowInsetsCompat.InsetType.systemBars())
                else { return event.insets }
                event.view.padding(left: systemBars.left(), top: systemBars.top(), right: systemBars.right(), bottom: systemBars.bottom())
                return event.insets
            }
        }
    }
}