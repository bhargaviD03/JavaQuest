import { LevelDefinition } from '../../components/GameLayout';

export const RESTAURANT_TYCOON_LEVELS: LevelDefinition[] = [
  {
    levelNumber: 1,
    title: 'Setting Up the Kitchen',
    topic: 'Variables & Data Types',
    learningObjective: 'Declare and initialize variables for table counts, names, ratings, and operational status.',
    scenario: 'Welcome Chef! Before open doors at Le Java Bistro, define the core restaurant state variables.',
    initialCode: `public class Restaurant {
    public static void main(String[] args) {
        int tableCount = 12;
        String restaurantName = "Le Java Bistro";
        double averageRating = 4.8;
        boolean isOpen = true;

        System.out.println("=== RESTAURANT STATUS ===");
        System.out.println("Name: " + restaurantName);
        System.out.println("Tables: " + tableCount);
        System.out.println("Rating: " + averageRating + " stars");
        System.out.println("Status: " + (isOpen ? "OPEN FOR SERVICE" : "CLOSED"));
    }
}
`,
    solutionHint: 'Declare int for whole numbers, String for text, double for decimals, and boolean for true/false.'
  },
  {
    levelNumber: 2,
    title: 'Taking Orders & Billing',
    topic: 'Operators & Calculations',
    learningObjective: 'Calculate subtotal, 8.5% sales tax, and 15% tip to produce the grand total.',
    scenario: 'A table ordered 2 Truffle Burgers and 2 Sparkling Drinks. Calculate and print the itemized check.',
    initialCode: `public class OrderCalculator {
    public static void main(String[] args) {
        double burgerPrice = 14.50;
        int burgerQty = 2;
        double drinkPrice = 3.50;
        int drinkQty = 2;

        double subtotal = (burgerPrice * burgerQty) + (drinkPrice * drinkQty);
        double tax = subtotal * 0.085;
        double tip = subtotal * 0.15;
        double grandTotal = subtotal + tax + tip;

        System.out.printf("Subtotal: $%.2f\\n", subtotal);
        System.out.printf("Tax (8.5%%): $%.2f\\n", tax);
        System.out.printf("Tip (15%%): $%.2f\\n", tip);
        System.out.printf("Grand Total: $%.2f\\n", grandTotal);
    }
}
`,
    solutionHint: 'Multiply unit quantities by price, then compute tax and tip percentages.'
  },
  {
    levelNumber: 3,
    title: 'Kitchen Decision Making',
    topic: 'If / Else & Logic',
    learningObjective: 'Route guests to Bar, Booth, or Banquet tables based on party size with VIP perks.',
    scenario: 'The front-of-house host needs automated seating logic depending on customer group size.',
    initialCode: `public class TableHost {
    public static void seatParty(int partySize, boolean isVip) {
        if (partySize <= 2) {
            System.out.println("ASSIGNMENT: Bar Counter Table");
        } else if (partySize <= 4) {
            System.out.println("ASSIGNMENT: Cozy Booth");
        } else {
            System.out.println("ASSIGNMENT: Banquet Table");
        }

        if (isVip) {
            System.out.println("COMPLIMENTARY: Welcome Sparkling Cider served!");
        }
    }

    public static void main(String[] args) {
        seatParty(2, false);
        seatParty(4, true);
    }
}
`,
    solutionHint: 'Use if (partySize <= 2) ... else if (partySize <= 4) ... else ...'
  },
  {
    levelNumber: 4,
    title: 'Menu Dispatcher',
    topic: 'Switch Expressions & Stations',
    learningObjective: 'Route order codes to the Grill, Sauce, Cold Prep, or Pastry station using switch.',
    scenario: 'Orders are flowing in rapidly. Direct each ticket to the responsible chef station.',
    initialCode: `public class KitchenDispatcher {
    public static String routeStation(int orderCode) {
        switch (orderCode) {
            case 1:
                return "GRILL_STATION: Ribeye Steak";
            case 2:
                return "SAUCE_STATION: Truffle Pasta";
            case 3:
                return "COLD_PREP_STATION: Caesar Salad";
            case 4:
                return "PASTRY_STATION: Lava Cake";
            default:
                return "UNKNOWN_STATION";
        }
    }

    public static void main(String[] args) {
        System.out.println(routeStation(2));
    }
}
`,
    solutionHint: 'Use a switch statement over orderCode with cases 1 to 4.'
  },
  {
    levelNumber: 5,
    title: 'Morning Mise en Place',
    topic: 'For Loops & Batches',
    learningObjective: 'Bake 5 batches of artisan bread using a for-loop and accumulate total loaves in the pantry.',
    scenario: 'The bakery oven is preheated. Prep bread batches before the lunch rush commences.',
    initialCode: `public class MorningPrep {
    public static void main(String[] args) {
        int totalBatches = 5;
        int loavesPerBatch = 8;
        int totalLoaves = 0;

        for (int i = 1; i <= totalBatches; i++) {
            totalLoaves += loavesPerBatch;
            System.out.println("Batch #" + i + " baked: " + loavesPerBatch + " loaves.");
        }

        System.out.println("Total artisan loaves ready: " + totalLoaves);
    }
}
`,
    solutionHint: 'Iterate from i = 1 to totalBatches and add loavesPerBatch to totalLoaves.'
  },
  {
    levelNumber: 6,
    title: 'Dinner Rush Queue',
    topic: 'While Loops & State',
    learningObjective: 'Process pending tickets in a while-loop until the order queue is completely cleared.',
    scenario: 'Peak dinner rush has arrived! Expedite plates one by one until zero tickets remain.',
    initialCode: `public class DinnerRush {
    public static void main(String[] args) {
        int ordersPending = 5;
        int ticketsServed = 0;

        while (ordersPending > 0) {
            ordersPending--;
            ticketsServed++;
            System.out.println("Expedited ticket #" + ticketsServed + " | Remaining: " + ordersPending);
        }

        System.out.println("RUSH CLEARED! Total expedited: " + ticketsServed);
    }
}
`,
    solutionHint: 'Use while (ordersPending > 0) and decrement ordersPending while incrementing ticketsServed.'
  },
  {
    levelNumber: 7,
    title: 'Dining Hall Grid',
    topic: '2D Arrays',
    learningObjective: 'Maintain a 3x3 table matrix of booleans to visualize seat occupancy.',
    scenario: 'Manage the 2.5D dining floor map and count occupied versus free tables.',
    initialCode: `public class DiningHallGrid {
    public static void main(String[] args) {
        boolean[][] floorPlan = new boolean[3][3];
        floorPlan[0][1] = true;
        floorPlan[2][2] = true;

        int occupied = 0;
        for (int r = 0; r < floorPlan.length; r++) {
            for (int c = 0; c < floorPlan[r].length; c++) {
                if (floorPlan[r][c]) occupied++;
            }
        }

        System.out.println("Occupied tables: " + occupied + " / 9");
    }
}
`,
    solutionHint: 'Traverse the 2D boolean array using nested for loops.'
  },
  {
    levelNumber: 8,
    title: 'Active Order Board',
    topic: 'ArrayList Collections',
    learningObjective: 'Manage dynamic order tickets with ArrayList add, remove, and size methods.',
    scenario: 'Customers place and cancel orders continuously. Use dynamic collections instead of fixed arrays.',
    initialCode: `import java.util.ArrayList;

public class OrderBoard {
    public static void main(String[] args) {
        ArrayList<String> orders = new ArrayList<>();
        orders.add("Table 1: Truffle Pasta");
        orders.add("Table 3: Wagyu Burger");
        orders.add("Table 2: Chocolate Cake");

        System.out.println("Queued orders: " + orders.size());
        String served = orders.remove(0);
        System.out.println("SERVED: " + served);
        System.out.println("Remaining queue: " + orders.size());
    }
}
`,
    solutionHint: 'Use orders.add(...) to push items and orders.remove(0) to pop the first order.'
  },
  {
    levelNumber: 9,
    title: 'Kitchen Disasters & Exceptions',
    topic: 'Try / Catch / Finally',
    learningObjective: 'Throw and catch custom OutOfStockException and execute guaranteed gas shutoff in finally.',
    scenario: 'A supplier failed to deliver truffle sauce! Handle ingredient stockout without crashing the kitchen.',
    initialCode: `class OutOfStockException extends Exception {
    public OutOfStockException(String msg) { super(msg); }
}

public class KitchenStockControl {
    public static void cookSpecial(int stock) throws OutOfStockException {
        if (stock <= 0) throw new OutOfStockException("Out of Truffle Sauce!");
        System.out.println("Special cooked successfully.");
    }

    public static void main(String[] args) {
        try {
            cookSpecial(0);
        } catch (OutOfStockException e) {
            System.out.println("RECOVERY: " + e.getMessage());
        } finally {
            System.out.println("FINALLY: Stove shut off and sanitized.");
        }
    }
}
`,
    solutionHint: 'Wrap cookSpecial in try-catch and put mandatory cleanup in finally.'
  },
  {
    levelNumber: 10,
    title: 'Grand Opening Capstone',
    topic: 'Full Restaurant Engine',
    learningObjective: 'Combine seating, menus, collections, and revenue calculation in the final shift loop.',
    scenario: 'The grand opening review is today! Execute the complete restaurant cycle with five-star service.',
    initialCode: `import java.util.ArrayList;

class MenuItem {
    String name;
    double price;
    public MenuItem(String n, double p) { name = n; price = p; }
}

public class GrandOpening {
    public static void main(String[] args) {
        ArrayList<MenuItem> menu = new ArrayList<>();
        menu.add(new MenuItem("Artisan Burger", 16.50));
        menu.add(new MenuItem("Truffle Rigatoni", 22.00));
        menu.add(new MenuItem("Molten Lava Cake", 9.50));

        double revenue = 0;
        for (MenuItem item : menu) {
            revenue += item.price;
            System.out.println("Served: " + item.name);
        }

        System.out.printf("Gross Revenue: $%.2f\\n", revenue);
        System.out.println("RESTAURANT RATING: 5.0 STARS!");
    }
}
`,
    solutionHint: 'Iterate over the menu list, accumulate item prices into revenue, and print final rating.'
  }
];
