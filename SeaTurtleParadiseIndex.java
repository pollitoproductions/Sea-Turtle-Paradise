import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class SeaTurtleParadiseIndex extends JPanel implements MouseListener, MouseMotionListener {
    // Modes
    private enum Mode { WATER, FOOD }
    private Mode mode = Mode.WATER;

    // Game state
    private final List<Food> food = new ArrayList<>();
    private final List<Wave> waves = new ArrayList<>();
    private final List<Particle> particles = new ArrayList<>();
    private final List<Turtle> turtles = new ArrayList<>();
    private boolean pointerActive = false;
    private int lastX = 0, lastY = 0;
    private final Random rand = new Random();

    // Animation timer
    private Timer timer;

    public SeaTurtleParadiseIndex() {
        setPreferredSize(new Dimension(1200, 800));
        setBackground(new Color(0x000714));
        addMouseListener(this);
        addMouseMotionListener(this);
        initParticles();
        initTurtles();
        timer = new Timer(16, e -> repaint());
        timer.start();
    }

    private void initParticles() {
        for (int i = 0; i < 150; i++) {
            particles.add(new Particle(
                rand.nextInt(1200),
                rand.nextInt(800),
                rand.nextDouble() * 2 + 0.5,
                rand.nextDouble() * 0.5 + 0.1,
                rand.nextDouble() * Math.PI * 2,
                rand.nextDouble() * 0.3 + 0.05
            ));
        }
    }

    private void initTurtles() {
        // Example palettes (colors)
        Color[] palette = { new Color(0x178a84), new Color(0x8cdada), new Color(0x3bbdb8), new Color(0x003d3d) };
        for (int i = 0; i < 8; i++) {
            double scale = 0.5 + rand.nextDouble();
            turtles.add(new Turtle(
                rand.nextInt(1200),
                rand.nextInt(800),
                rand.nextDouble() * Math.PI * 2,
                rand.nextDouble() * Math.PI * 2,
                (0.4 + rand.nextDouble() * 0.5) * scale,
                scale,
                palette
            ));
        }
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D ctx = (Graphics2D) g;
        int width = getWidth();
        int height = getHeight();
        long time = System.currentTimeMillis();

        // 1. Draw Deep Water Background
        GradientPaint bgGrad = new GradientPaint(0, 0, new Color(0x001e36), 0, height, new Color(0x000714));
        ctx.setPaint(bgGrad);
        ctx.fillRect(0, 0, width, height);

        // 2. Draw Particles
        for (Particle p : particles) {
            p.y -= p.speed;
            p.x += Math.sin(time * 0.001 + p.offset) * 0.4;
            if (p.y < -20) {
                p.y = height + 20;
                p.x = rand.nextInt(width);
            }
            ctx.setColor(new Color(255, 255, 255, (int)(p.alpha * 255)));
            ctx.fillOval((int)p.x, (int)p.y, (int)p.size, (int)p.size);
        }

        // 3. Draw Turtles
        for (Turtle t : turtles) {
            t.update(width, height, food);
            t.draw(ctx, time);
        }

        // 4. Draw Food
        for (Food f : food) {
            f.draw(ctx);
        }

        // 5. Draw Waves
        for (Wave w : waves) {
            w.age++;
            if (w.age < w.life) {
                ctx.setColor(new Color(180, 230, 255, (int)((1 - (double)w.age / w.life) * 128)));
                ctx.setStroke(new BasicStroke(4 * (1 - (double)w.age / w.life)));
                ctx.drawOval(w.x - (int)w.radius(), w.y - (int)w.radius(), (int)w.radius() * 2, (int)w.radius() * 2);
            }
        }
        waves.removeIf(w -> w.age >= w.life);
    }

    // Mouse events
    @Override
    public void mousePressed(MouseEvent e) {
        pointerActive = true;
        lastX = e.getX();
        lastY = e.getY();
        if (mode == Mode.FOOD) {
            food.add(new Food(lastX, lastY));
            waves.add(new Wave(lastX, lastY, 60, 1.5));
        } else {
            waves.add(new Wave(lastX, lastY, 100, 2.5));
        }
    }
    @Override
    public void mouseReleased(MouseEvent e) { pointerActive = false; }
    @Override
    public void mouseDragged(MouseEvent e) {
        if (!pointerActive || mode != Mode.WATER) return;
        int x = e.getX();
        int y = e.getY();
        if (Math.hypot(x - lastX, y - lastY) > 25) {
            waves.add(new Wave(x, y, 80, 2));
            lastX = x;
            lastY = y;
        }
    }
    @Override
    public void mouseMoved(MouseEvent e) {}
    @Override
    public void mouseClicked(MouseEvent e) {}
    @Override
    public void mouseEntered(MouseEvent e) {}
    @Override
    public void mouseExited(MouseEvent e) {}

    // Mode toggle UI (simple)
    public void toggleMode() {
        mode = (mode == Mode.WATER) ? Mode.FOOD : Mode.WATER;
    }

    // Main entry point
    public static void main(String[] args) {
        JFrame frame = new JFrame("Sea Turtle Paradise");
        SeaTurtleParadiseIndex panel = new SeaTurtleParadiseIndex();
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.add(panel);
        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
        // Simple mode toggle with spacebar
        frame.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                if (e.getKeyCode() == KeyEvent.VK_SPACE) {
                    panel.toggleMode();
                }
            }
        });
    }

    // --- Inner classes ---
    static class Particle {
        double x, y, size, speed, offset, alpha;
        Particle(double x, double y, double size, double speed, double offset, double alpha) {
            this.x = x; this.y = y; this.size = size; this.speed = speed; this.offset = offset; this.alpha = alpha;
        }
    }
    static class Food {
        int x, y;
        double size = 15;
        Food(int x, int y) { this.x = x; this.y = y; }
        void draw(Graphics2D ctx) {
            ctx.setColor(new Color(0x81cf9d));
            ctx.fillOval(x - 10, y - 10, 20, 20);
        }
    }
    static class Wave {
        int x, y, age = 0, life;
        double speed;
        Wave(int x, int y, int life, double speed) {
            this.x = x; this.y = y; this.life = life; this.speed = speed;
        }
        double radius() { return 10 + age * speed; }
    }
    static class Turtle {
        double x, y, angle, targetAngle, speed, scale;
        Color[] palette;
        Turtle(double x, double y, double angle, double targetAngle, double speed, double scale, Color[] palette) {
            this.x = x; this.y = y; this.angle = angle; this.targetAngle = targetAngle; this.speed = speed; this.scale = scale; this.palette = palette;
        }
        void update(int width, int height, List<Food> food) {
            // Simple AI: move towards food if present
            if (!food.isEmpty()) {
                Food f = food.get(0);
                double dx = f.x - x;
                double dy = f.y - y;
                targetAngle = Math.atan2(dy, dx);
                speed = speed * 1.5;
                if (Math.hypot(dx, dy) < 60 * scale) {
                    food.remove(f);
                }
            }
            // Move
            angle += (targetAngle - angle) * 0.05;
            x += Math.cos(angle) * speed;
            y += Math.sin(angle) * speed;
            // Stay in bounds
            x = Math.max(50, Math.min(width - 50, x));
            y = Math.max(50, Math.min(height - 50, y));
        }
        void draw(Graphics2D ctx, long time) {
            ctx.setColor(palette[0]);
            ctx.fillOval((int)x - (int)(40 * scale), (int)y - (int)(30 * scale), (int)(80 * scale), (int)(60 * scale));
            ctx.setColor(palette[1]);
            ctx.fillOval((int)x - (int)(20 * scale), (int)y - (int)(15 * scale), (int)(40 * scale), (int)(30 * scale));
        }
    }
}
